// src/main/java/com/example/soa/config/SecurityConfig.java
package com.example.soa.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.soa.security.CustomOidcUserService;
import com.example.soa.security.CustomUserDetailsService;
import com.example.soa.security.JwtAuthenticationEntryPoint;
import com.example.soa.security.JwtAuthenticationFilter;
import com.example.soa.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final CustomOidcUserService customOidcUserService;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtTokenProvider tokenProvider;

    public SecurityConfig(
        CustomOidcUserService customOidcUserService,
        CustomUserDetailsService customUserDetailsService,
        JwtAuthenticationEntryPoint unauthorizedHandler,
        JwtTokenProvider tokenProvider) {
        this.customOidcUserService = customOidcUserService;
        this.customUserDetailsService = customUserDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.tokenProvider = tokenProvider;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, customUserDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(List.of(
            "http://localhost:3000", 
            "http://localhost:8080", 
            "http://localhost:8081", 
            "http://localhost:5173"
        ));
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(List.of(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "Accept", 
            "Origin", 
            "Access-Control-Request-Method", 
            "Access-Control-Request-Headers"
        ));
        corsConfig.setExposedHeaders(List.of(
            "Authorization",
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials"
        ));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/static/**", "/login", "/oauth2/**").permitAll()
                // Swagger UI access
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**", "/actuator/**").permitAll()
                .requestMatchers("/api/courses/**").permitAll()
                .requestMatchers("/api/enrollments/**").permitAll()
                .requestMatchers("/api/content/**", "/content/**", "/api/contents/**", "/contents/**").authenticated()
                .requestMatchers("/api/assessment/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole(Role.ADMIN)
                .requestMatchers("/api/instructor/**").hasRole(Role.INSTRUCTOR)
                .requestMatchers("/api/student/**").hasRole(Role.STUDENT)
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOidcUserService)
                )
                .successHandler((request, response, authentication) -> {
                    String token = tokenProvider.generateToken(authentication);
                    
                    // Redirect to the frontend application with the token
                    String redirectUrl = "http://localhost:3000/?token=" + token;
                    response.sendRedirect(redirectUrl);
                })
                .failureHandler((request, response, exception) -> {
                    logger.error("OAuth2 authentication failed", exception);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"OAuth2 Authentication failed\", \"message\":\"" + exception.getMessage() + "\"}");
                })
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"message\":\"Logout successful\"}");
                })
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    public static class Role {
        public static final String ADMIN = "ADMIN";
        public static final String INSTRUCTOR = "INSTRUCTOR";
        public static final String STUDENT = "STUDENT";
    }
}