#include <stdio.h>

#include "esp_wifi_default.h"
#include "esp_wifi_types_generic.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"

#include "esp_check.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_err.h"
#include "esp_event.h"
#include "esp_event_base.h"
#include "esp_netif.h"
#include "esp_netif_types.h"

#include "network_provisioning/manager.h"
#include "network_provisioning/scheme_softap.h"
#include "network_provisioning/network_config.h"

#include "qrcode.h"
#include "portmacro.h"
#include "protocomm_security.h"

#include "network_prov_helper.h"

#include "config.h"

static EventGroupHandle_t wifi_event_group;
const int WIFI_CONNECTED_EVENT = BIT0;

static void network_prov_print_qr(const char* name, const char* username, const char* pop, const char* transport) {
    char payload[150] = {0};

    snprintf(payload,
             sizeof(payload),
             "{\"ver\": \"%s\", \"name\": \"%s\", \"pop\": \"%s\", \"transport\": \"%s\"}",
             PROV_QR_VERSION, name, pop, transport);

    ESP_LOGI(NETWORKPROV_TAG, "Scan this QR code from the provisioning application for Provisioning.");
    esp_qrcode_config_t config = ESP_QRCODE_CONFIG_DEFAULT();
    esp_qrcode_generate(&config, payload);
    ESP_LOGI(NETWORKPROV_TAG, "If QR code is not visible, copy paste the below URL in a browser. \n%s?data=%s", QRCODE_BASE_URL, payload);
}

static void network_prov_event_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) {
    if (event_base == NETWORK_PROV_EVENT) {
        switch (event_id) {
            case NETWORK_PROV_START:
                ESP_LOGI(NETWORKPROV_TAG, "Provisioning started");
                break;
            case NETWORK_PROV_WIFI_CRED_RECV:
                wifi_sta_config_t* wifi_sta_config = (wifi_sta_config_t*) event_data;
                ESP_LOGI(NETWORKPROV_TAG,
                         "Received Wi-Fi credentials"
                         "\n\tSSID: %s\n\tPassword: %s",
                         (const char*) wifi_sta_config->ssid,
                         (const char*) wifi_sta_config->password);
                break;
            case NETWORK_PROV_WIFI_CRED_FAIL:
                network_prov_wifi_sta_fail_reason_t* reason = (network_prov_wifi_sta_fail_reason_t*) event_data;
                ESP_LOGE(NETWORKPROV_TAG,
                         "Provisioning failed!\n\tReason: %s"
                         "\n\tPlease reset to factory and retry provisioning",
                         (*reason == NETWORK_PROV_WIFI_STA_AUTH_ERROR) ?
                         "Wi-Fi station authentication failed" :
                         "Wi-Fi access-point not found");
                break;
            case NETWORK_PROV_WIFI_CRED_SUCCESS:
                ESP_LOGI(NETWORKPROV_TAG, "Provisioning successful");
                break;
            case NETWORK_PROV_END:
                network_prov_mgr_deinit();
                break;
            default:
                break;
        }
    } else if (event_base == WIFI_EVENT) {
        switch (event_id) {
            case WIFI_EVENT_STA_START:
                esp_wifi_connect();
                break;
            case WIFI_EVENT_STA_DISCONNECTED:
                ESP_LOGI(NETWORKPROV_TAG, "Disconnected. Connecting to the AP again...");
                esp_wifi_connect();
                break;
            default:
                break;
        }
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t* ) event_data;
        ESP_LOGI(NETWORKPROV_TAG,
                 "Connected with IP Address:" IPSTR,
                 IP2STR(&event->ip_info.ip));
        xEventGroupSetBits(wifi_event_group, WIFI_CONNECTED_EVENT);
    } else if (event_base == PROTOCOMM_SECURITY_SESSION_EVENT) {
        switch (event_id) {
            case PROTOCOMM_SECURITY_SESSION_SETUP_OK:
                ESP_LOGI(NETWORKPROV_TAG, "Secured session established!");
                break;
            case PROTOCOMM_SECURITY_SESSION_INVALID_SECURITY_PARAMS:
                ESP_LOGE(NETWORKPROV_TAG, "Received invalid security parameters for establishing secure session!");
                break;
            case PROTOCOMM_SECURITY_SESSION_CREDENTIALS_MISMATCH:
                ESP_LOGE(NETWORKPROV_TAG, "Received incorrect username and/or PoP for establishing secure session!");
                break;
            default:
                break;
        }
    }
}

static void register_event_handler() {
    ESP_ERROR_CHECK(esp_event_handler_register(NETWORK_PROV_EVENT,
                                               ESP_EVENT_ANY_ID,
                                               &network_prov_event_handler,
                                               NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(PROTOCOMM_SECURITY_SESSION_EVENT,
                                               ESP_EVENT_ANY_ID,
                                               &network_prov_event_handler,
                                               NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT,
                                               IP_EVENT_STA_GOT_IP, 
                                               &network_prov_event_handler, 
                                               NULL));
}

static void wifi_init() {
    esp_netif_create_default_wifi_sta();
    esp_netif_create_default_wifi_ap();

    wifi_init_config_t wifi_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_config));
}

static void network_prov_manager_init() {
    network_prov_mgr_config_t network_config = {
        .network_prov_wifi_conn_cfg = {
            .wifi_conn_attempts = 5,
        },
        .scheme = network_prov_scheme_softap,
        .scheme_event_handler = NETWORK_PROV_EVENT_HANDLER_NONE,
    };

    ESP_ERROR_CHECK(network_prov_mgr_init(network_config));
}

static void start_provisioning() {
    ESP_LOGI(NETWORKPROV_TAG,"Starting provisioning mode...");

    network_prov_security_t security = NETWORK_PROV_SECURITY_1;

    ESP_ERROR_CHECK(network_prov_mgr_start_provisioning(security,
                                                        (const void*) NETWORKPROV_POP,
                                                        NETWORKPROV_NAME,
                                                        NULL));

    network_prov_print_qr(NETWORKPROV_NAME, NULL, NETWORKPROV_POP, "softap");
}

static void start_station() {
    ESP_LOGI(NETWORKPROV_TAG, "Already provisioned, starting Wi-Fi STA");

    network_prov_mgr_deinit();
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT,
                                               ESP_EVENT_ANY_ID,
                                               &network_prov_event_handler,
                                               NULL));

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_start());
}

esp_err_t network_prov_init() {
    ESP_RETURN_ON_ERROR(esp_netif_init(), NETWORKPROV_TAG, "Failed to init Network Interface");

    ESP_ERROR_CHECK(esp_event_loop_create_default());

    wifi_event_group = xEventGroupCreate();

    if (wifi_event_group == NULL) {
        return ESP_ERR_NO_MEM;
    }

    register_event_handler();
    wifi_init();
    network_prov_manager_init();

    bool provisioned = false;
    ESP_ERROR_CHECK(network_prov_mgr_is_wifi_provisioned(&provisioned));

    if (!provisioned) {
        start_provisioning();    
    } else {
        start_station();
    }

    xEventGroupWaitBits(wifi_event_group,
                        WIFI_CONNECTED_EVENT,
                        true,
                        true,
                        portMAX_DELAY);

    return ESP_OK;
}