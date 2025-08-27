package com.shopping.controller;

import com.shopping.model.User;
import com.shopping.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:19006"})
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public Flux<User> getAllUsers() {
        log.info("GET /api/users - Getting all users");
        return userService.getAllActiveUsers();
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getUserById(@PathVariable UUID id) {
        log.info("GET /api/users/{} - Getting user by id", id);
        
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    public Mono<ResponseEntity<User>> getUserByEmail(@PathVariable String email) {
        log.info("GET /api/users/email/{} - Getting user by email", email);
        
        return userService.getUserByEmail(email)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Mono<ResponseEntity<User>> createUser(@Valid @RequestBody User user) {
        log.info("POST /api/users - Creating user with email: {}", user.getEmail());
        
        return userService.createUser(user)
            .map(createdUser -> ResponseEntity.status(HttpStatus.CREATED).body(createdUser))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<User>> updateUser(@PathVariable UUID id, @Valid @RequestBody User user) {
        log.info("PUT /api/users/{} - Updating user", id);
        
        return userService.updateUser(id, user)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable UUID id) {
        log.info("DELETE /api/users/{} - Deleting user", id);
        
        return userService.deleteUser(id)
            .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }
    
    @PatchMapping("/{id}/deactivate")
    public Mono<ResponseEntity<Void>> deactivateUser(@PathVariable UUID id) {
        log.info("PATCH /api/users/{}/deactivate - Deactivating user", id);
        
        return userService.deactivateUser(id)
            .then(Mono.just(ResponseEntity.ok().<Void>build()))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public Flux<User> searchUsers(@RequestParam String name) {
        log.info("GET /api/users/search?name={} - Searching users", name);
        return userService.searchUsersByName(name);
    }
    
    @GetMapping("/role/{role}")
    public Flux<User> getUsersByRole(@PathVariable User.UserRole role) {
        log.info("GET /api/users/role/{} - Getting users by role", role);
        return userService.getUsersByRole(role);
    }
    
    @GetMapping("/count")
    public Mono<Long> countActiveUsers() {
        log.info("GET /api/users/count - Counting active users");
        return userService.countActiveUsers();
    }
}
