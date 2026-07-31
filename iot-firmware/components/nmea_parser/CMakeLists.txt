idf_component_register(
    SRCS "nmea_parser.c" "neo6mgps_payload.c"
    REQUIRES esp_event esp_driver_uart time_sync
    INCLUDE_DIRS "include"
)