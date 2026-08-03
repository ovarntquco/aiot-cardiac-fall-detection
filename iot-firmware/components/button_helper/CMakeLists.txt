idf_component_register(
    SRCS "button_helper.c"
    PRIV_REQUIRES 
        button
        event_payload
        main
    INCLUDE_DIRS "include"
)