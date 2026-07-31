#include <stdint.h>

#include "esp_err.h"
#include "esp_log.h"
#include "esp_crt_bundle.h"

#include "mqtt_client.h"

#include "config.h"
#include "mqtt_helper.h"

static volatile bool s_mqtt_connected = false;
static esp_mqtt_client_handle_t s_mqtt_client;

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    ESP_LOGD(MQTT_TAG, "Event dispatched from event loop base=%s, event_id=%" PRIi32, base, event_id);

    esp_mqtt_event_handle_t event = event_data;

    switch ((esp_mqtt_event_id_t) event_id) {
        case MQTT_EVENT_CONNECTED:
            s_mqtt_connected = true;
            ESP_LOGI(MQTT_TAG, "MQTT connected to HiveMQ");
            break;
        case MQTT_EVENT_DISCONNECTED:
            s_mqtt_connected = false;
            ESP_LOGW(MQTT_TAG, "MQTT disconnected");
            break;
        case MQTT_EVENT_SUBSCRIBED:
            ESP_LOGI(MQTT_TAG, "Subscribed, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_UNSUBSCRIBED:
            ESP_LOGI(MQTT_TAG, "Unsubscribed, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_PUBLISHED:
            ESP_LOGI(MQTT_TAG, "Published, msg_id=%d", event->msg_id);
            break;
        case MQTT_EVENT_DATA:
            ESP_LOGI(MQTT_TAG, "Data received:");
            ESP_LOGI(MQTT_TAG, "  Topic: %.*s", event->topic_len, event->topic);
            ESP_LOGI(MQTT_TAG, "  Data:  %.*s", event->data_len, event->data);
            // ONLY PUBLISH IN THIS APP
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGE(MQTT_TAG, "MQTT_EVENT_ERROR");
            if (event->error_handle->error_type == MQTT_ERROR_TYPE_TCP_TRANSPORT) {
                ESP_LOGE(MQTT_TAG, "  Transport error: esp-tls: 0x%x, tls stack: 0x%x, socket errno: %d",
                         event->error_handle->esp_tls_last_esp_err,
                         event->error_handle->esp_tls_stack_err,
                         event->error_handle->esp_transport_sock_errno);
            } else if (event->error_handle->error_type == MQTT_ERROR_TYPE_CONNECTION_REFUSED) {
                ESP_LOGE(MQTT_TAG, "  Connection refused, reason: 0x%x",
                         event->error_handle->connect_return_code);
            } else {
                ESP_LOGE(MQTT_TAG, "  Unknown error type: 0x%x", event->error_handle->error_type);
            }
            break;
        default:
            ESP_LOGD(MQTT_TAG, "Unhandled MQTT event id: %d", event_id);
            break;
    }
}

esp_err_t mqtt_init() {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = MQTT_BROKER_URI,
        .broker.verification.crt_bundle_attach = esp_crt_bundle_attach,
        .credentials.username = MQTT_USERNAME,
        .credentials.authentication.password = MQTT_PASSWORD,
    };

    s_mqtt_client = esp_mqtt_client_init(&mqtt_cfg);

    if (NULL == s_mqtt_client) {
        return ESP_FAIL;
    }

    esp_err_t err = esp_mqtt_client_register_event(s_mqtt_client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    
    if (ESP_OK != err) {
        return err;
    }
    
    return esp_mqtt_client_start(s_mqtt_client);
}

bool mqtt_is_connected() {
    return s_mqtt_connected;
}

esp_mqtt_client_handle_t mqtt_get_client() {
    return s_mqtt_client;
}

bool mqtt_publish_topic(char* payload, const char* tag, const char* topic) {
    int msg_id = esp_mqtt_client_publish(s_mqtt_client, topic, payload, 0, 1, 0);

    free(payload);

    if (msg_id < 0) {
        ESP_LOGW(tag, "%s publish failed", topic);
        return false;
    }

    return true;
}
