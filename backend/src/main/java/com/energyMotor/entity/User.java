package com.energyMotor.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(unique= true, nullable = false)
    private String email;


    private String password;

    private boolean enabled;

    private String verificationCode;
}
