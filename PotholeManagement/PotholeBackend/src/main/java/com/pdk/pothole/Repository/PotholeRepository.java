package com.pdk.pothole.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pdk.pothole.Entity.Pothole;

public interface PotholeRepository extends JpaRepository<Pothole, Long> {
    List<Pothole> findByUser_IdOrderByReportedDateDesc(Long userId);
}