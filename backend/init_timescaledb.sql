-- =============================================================================
-- Project-MELV :: Enterprise Spatiotemporal Hypertable Schema
-- TimescaleDB + PostGIS Spatial Graph Extension (SIH PS 26127)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Camera Node Registry with Geographic Coordinates (EPSG:4326 WGS84)
CREATE TABLE IF NOT EXISTS camera_nodes (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    zone VARCHAR(64),
    target_fps INT DEFAULT 30,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- Seed Kanathur Corridor Nodes
INSERT INTO camera_nodes (id, name, latitude, longitude, location_geom, zone)
VALUES
    ('CAM-01', 'CLV Nagar 1st St - West Gate (ECR)', 12.8542, 80.2378, ST_SetSRID(ST_MakePoint(80.2378, 12.8542), 4326), 'ZONE-A'),
    ('CAM-02', 'CLV Nagar 1st St - East Junction', 12.8548, 80.2386, ST_SetSRID(ST_MakePoint(80.2386, 12.8548), 4326), 'ZONE-A'),
    ('CAM-03', 'Kanathur ECR Toll Plaza Approach', 12.8530, 80.2365, ST_SetSRID(ST_MakePoint(80.2365, 12.8530), 4326), 'ZONE-B'),
    ('CAM-04', 'Reddykuppam Road Junction', 12.8518, 80.2350, ST_SetSRID(ST_MakePoint(80.2350, 12.8518), 4326), 'ZONE-B'),
    ('CAM-05', 'AMET University Campus Gate (ECR)', 12.8556, 80.2394, ST_SetSRID(ST_MakePoint(80.2394, 12.8556), 4326), 'ZONE-A'),
    ('CAM-06', 'Mayajaal Multiplex North Feeder', 12.8570, 80.2410, ST_SetSRID(ST_MakePoint(80.2410, 12.8570), 4326), 'ZONE-C'),
    ('CAM-07', 'Kovalam Beach Link', 12.8510, 80.2340, ST_SetSRID(ST_MakePoint(80.2340, 12.8510), 4326), 'ZONE-C'),
    ('CAM-08', 'Tambaram Outer Ring Road (Far Node)', 12.7900, 80.1500, ST_SetSRID(ST_MakePoint(80.1500, 12.7900), 4326), 'ZONE-PERIPHERY')
ON CONFLICT (id) DO NOTHING;

-- 2. TimescaleDB Partitioned Detections Hypertable (10,000+ camera horizontal scale)
CREATE TABLE IF NOT EXISTS vehicle_detections (
    detection_time TIMESTAMPTZ NOT NULL,
    plate_number VARCHAR(32) NOT NULL,
    camera_id VARCHAR(32) NOT NULL REFERENCES camera_nodes(id),
    tracker_id INT DEFAULT 0,
    confidence_ocr DOUBLE PRECISION DEFAULT 0.0,
    confidence_vehicle DOUBLE PRECISION DEFAULT 0.0,
    vehicle_class VARCHAR(32) DEFAULT 'CAR',
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    point_geom GEOMETRY(Point, 4326)
);

-- Convert to TimescaleDB Hypertable partitioned by detection_time (1-day chunk intervals)
SELECT create_hypertable('vehicle_detections', 'detection_time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- Create spatial & index optimizations
CREATE INDEX IF NOT EXISTS idx_detections_plate_time ON vehicle_detections (plate_number, detection_time DESC);
CREATE INDEX IF NOT EXISTS idx_detections_cam_time ON vehicle_detections (camera_id, detection_time DESC);
CREATE INDEX IF NOT EXISTS idx_detections_geom ON vehicle_detections USING GIST (point_geom);

-- 3. Directed Graph Trajectory Segments
CREATE TABLE IF NOT EXISTS corridor_graph_edges (
    edge_id SERIAL PRIMARY KEY,
    origin_camera VARCHAR(32) NOT NULL REFERENCES camera_nodes(id),
    destination_camera VARCHAR(32) NOT NULL REFERENCES camera_nodes(id),
    distance_meters DOUBLE PRECISION NOT NULL,
    design_speed_kmh DOUBLE PRECISION DEFAULT 40.0,
    typical_travel_time_sec DOUBLE PRECISION NOT NULL,
    corridor_name VARCHAR(128)
);

INSERT INTO corridor_graph_edges (origin_camera, destination_camera, distance_meters, design_speed_kmh, typical_travel_time_sec, corridor_name)
VALUES
    ('CAM-01', 'CAM-02', 105.0, 40.0, 9.45, 'CLV Nagar 1st Street'),
    ('CAM-02', 'CAM-01', 105.0, 40.0, 9.45, 'CLV Nagar 1st Street'),
    ('CAM-01', 'CAM-05', 225.0, 50.0, 16.20, 'East Coast Road Northbound'),
    ('CAM-05', 'CAM-01', 225.0, 50.0, 16.20, 'East Coast Road Southbound'),
    ('CAM-03', 'CAM-01', 180.0, 50.0, 12.96, 'Kanathur Toll Link'),
    ('CAM-05', 'CAM-06', 220.0, 50.0, 15.84, 'Mayajaal Approach')
ON CONFLICT DO NOTHING;

-- 4. MoRTH Parivahan Automated E-Challan Registry
CREATE TABLE IF NOT EXISTS parivahan_echallans (
    challan_number VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64),
    plate_number VARCHAR(32) NOT NULL,
    violation_type VARCHAR(64) NOT NULL,
    fine_amount_inr INT NOT NULL,
    location_name VARCHAR(128) NOT NULL,
    camera_id VARCHAR(32) REFERENCES camera_nodes(id),
    issued_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parivahan_portal_status VARCHAR(64) DEFAULT 'ISSUED_NIC_PARIVAHAN',
    sha256_cryptographic_proof VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_echallan_plate ON parivahan_echallans (plate_number);
