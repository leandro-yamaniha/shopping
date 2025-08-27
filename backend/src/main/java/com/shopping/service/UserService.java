package com.shopping.service;

import com.shopping.model.User;
import com.shopping.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public Flux<User> getAllUsers() {
        log.debug("Getting all users");
        return userRepository.findAll();
    }
    
    public Flux<User> getAllActiveUsers() {
        log.debug("Getting all active users");
        return userRepository.findAllActive();
    }
    
    public Mono<User> getUserById(UUID id) {
        log.debug("Getting user by id: {}", id);
        return userRepository.findById(id);
    }
    
    public Mono<User> getUserByEmail(String email) {
        log.debug("Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }
    
    public Mono<User> createUser(User user) {
        log.debug("Creating user with email: {}", user.getEmail());
        
        return userRepository.existsByEmail(user.getEmail())
            .flatMap(exists -> {
                if (exists) {
                    return Mono.error(new IllegalArgumentException("User with email already exists"));
                }
                
                // Hash password
                user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
                user.setId(UUID.randomUUID());
                
                return userRepository.save(user);
            });
    }
    
    public Mono<User> updateUser(UUID id, User user) {
        log.debug("Updating user with id: {}", id);
        
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
            .flatMap(existingUser -> {
                // Update fields
                existingUser.setFirstName(user.getFirstName());
                existingUser.setLastName(user.getLastName());
                existingUser.setPhone(user.getPhone());
                existingUser.setIsActive(user.getIsActive());
                
                // Only update password if provided
                if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
                    existingUser.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
                }
                
                return userRepository.save(existingUser);
            });
    }
    
    public Mono<Void> deleteUser(UUID id) {
        log.debug("Deleting user with id: {}", id);
        return userRepository.deleteById(id);
    }
    
    public Mono<Void> deactivateUser(UUID id) {
        log.debug("Deactivating user with id: {}", id);
        
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
            .flatMap(user -> {
                user.setIsActive(false);
                return userRepository.save(user);
            })
            .then();
    }
    
    public Flux<User> searchUsersByName(String name) {
        log.debug("Searching users by name: {}", name);
        return userRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Flux<User> getUsersByRole(User.UserRole role) {
        log.debug("Getting users by role: {}", role);
        return userRepository.findByRole(role);
    }
    
    public Mono<Long> countActiveUsers() {
        log.debug("Counting active users");
        return userRepository.countActiveUsers();
    }
    
    public Mono<Boolean> validatePassword(String email, String rawPassword) {
        log.debug("Validating password for email: {}", email);
        
        return userRepository.findByEmail(email)
            .map(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()))
            .defaultIfEmpty(false);
    }
}
