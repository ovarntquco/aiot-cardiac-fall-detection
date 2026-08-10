#ifndef TIME_SYNC_H
#define TIME_SYNC_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

esp_err_t   time_sync_init(void);
int64_t     get_epoch_ms_now(void);

#ifdef __cplusplus
}
#endif

#endif