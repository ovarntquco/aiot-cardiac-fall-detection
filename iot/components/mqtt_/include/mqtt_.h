#ifndef MQTT_HELPER_H
#define MQTT_HELPER_H

#include "esp_err.h"

#include "mqtt_client.h"

#ifdef __cpluscplus
extern "C" {
#endif

#define MQTT_TAG "MQTT"

esp_err_t                   mqtt_init();
uint8_t                     mqtt_is_connected();
esp_mqtt_client_handle_t    mqtt_get_client();
uint8_t                     mqtt_publish_topic(char* const payload, const char* tag, const char* topic);

#ifdef __cpluscplus
}
#endif

#endif