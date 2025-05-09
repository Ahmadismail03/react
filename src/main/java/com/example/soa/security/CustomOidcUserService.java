package com.example.soa.security;

import com.example.soa.Model.User;
import com.example.soa.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;

@Service
public class CustomOidcUserService extends OidcUserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        
        // Check if user exists in database
        User user = userRepository.findByEmail(oidcUser.getEmail())
            .orElseGet(() -> {
                // Create new user if not exists
                User newUser = new User();
                newUser.setEmail(oidcUser.getEmail());
                newUser.setName(oidcUser.getFullName());
                newUser.setPassword(""); // OAuth2 users don't need password
                newUser.setRole(User.Role.STUDENT); // Default role
                return userRepository.save(newUser);
            });
        
        // Create UserPrincipal from database user
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        
        // Set OIDC token and user info
        userPrincipal.setIdToken(oidcUser.getIdToken());
        userPrincipal.setUserInfo(oidcUser.getUserInfo());
        userPrincipal.setAttributes(oidcUser.getAttributes());
        
        return userPrincipal;
    }
}