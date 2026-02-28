package com.pdk.pothole.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pdk.pothole.Entity.User;
import com.pdk.pothole.Repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@roadguard.com")) {
            User admin = new User();
            admin.setEmail("admin@roadguard.com");
            admin.setName("Admin");
            admin.setPhoneNumber("9999999999");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println(">>> Admin user created: admin@roadguard.com / admin123");
        } else {
            System.out.println(">>> Admin user already exists.");
        }
    }
}
