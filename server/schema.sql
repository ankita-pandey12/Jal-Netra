CREATE DATABASE IF NOT EXISTS jalnetra;
USE jalnetra;

CREATE TABLE IF NOT EXISTS tankers (
    id VARCHAR(10) PRIMARY KEY,
    status ENUM('AVAILABLE', 'EN-ROUTE', 'UNLOADING', 'MAINTENANCE', 'VERIFIED') DEFAULT 'AVAILABLE',
    assignment VARCHAR(255) DEFAULT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    otp VARCHAR(4) DEFAULT NULL,
    geofence VARCHAR(50) DEFAULT 'SECURE'
);

-- Reset and insert initial fleet
TRUNCATE TABLE tankers;
INSERT INTO tankers (id, status, assignment, lat, lng, geofence) VALUES
('T-101', 'AVAILABLE', NULL, 21.1458, 79.0882, 'SECURE'),
('T-102', 'EN-ROUTE', 'Katol', 21.2, 78.8, 'SECURE'),
('T-103', 'AVAILABLE', NULL, 21.1458, 79.0882, 'SECURE'),
('T-104', 'UNLOADING', 'Hingna', 21.1147, 79.0304, 'SECURE'),
('T-105', 'AVAILABLE', NULL, 21.1458, 79.0882, 'SECURE');
