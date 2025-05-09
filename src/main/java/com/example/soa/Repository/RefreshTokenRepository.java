package com.example.soa.Repository;

import com.example.soa.Model.RefreshToken;
import com.example.soa.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    boolean existsByToken(String token); // Check if a token exists

    void deleteByUser_UserId(Long userId); // More efficient than deleteByUser(User user)

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.expiryDate > :now")
    Optional<RefreshToken> findValidTokenByUserId(@Param("userId") Long userId, @Param("now") Instant now);

    @Modifying
    @Transactional
    void deleteByUser(User user);
}
