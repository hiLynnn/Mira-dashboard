/**
 * MISA eShop to Google BigQuery Auto Pipeline (Multi-Job Version)
 * Author: Antigravity AI
 * 
 * HƯỚNG DẪN THÊM BÁO CÁO MỚI:
 * 1. Tạo bảng đích trên BigQuery (ví dụ: `inventory_summary`).
 * 2. Kéo xuống phần `HỆ THỐNG CẤU HÌNH BÁO CÁO (JOBS)` ở dưới.
 * 3. Thêm cấu hình báo cáo mới vào mảng `JOBS` (đã có mẫu hướng dẫn chi tiết).
 * 4. Chạy hàm `setupSheet` để cập nhật nếu có thay đổi cấu trúc sheet.
 */

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// ─────────────────────────────────────────────────────────────────────────────
// 0. HỆ THỐNG CẤU HÌNH BÁO CÁO (JOBS) - Thêm báo cáo mới tại đây!
// ─────────────────────────────────────────────────────────────────────────────

const JOBS = [
  {
    // Báo cáo số 1: Chi tiết bán hàng (order_detail)
    name: "order_detail",              // Tên bảng trên BigQuery
    reportId: "OrderItemRevenueReportDetail",
    dateField: "order_date",           // Cột ngày dùng để lọc cuốn chiếu
    uniqueKeys: ["order_detail_id"],   // Khóa chính để chống trùng lặp dữ liệu
    
    // Cấu hình tham số gửi lên API MISA
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_order_change_date": 1,
      "v_combo_distribute": 0,
      "v_basic_unit_conversion": 0,
      "v_channel_id": "All,90,5,20,70,30,110,10,120,50,95",
      "v_cashier_ids": "All",
      "v_seller_ids": "All",
      "v_customer_ids": "All",
      "v_tax_mode": 3,
      "v_is_refresh": true,
      "v_session_key": "31dadf56c4ec76c3a95836bc4865fe9975556aa7a1654437be2ef67f42c3577c"
    },
    
    // Khai báo danh sách các cột cần lấy từ API
    columns: [
      {"dataFormat": 6, "field": "order_date", "hasSummary": true},
      {"dataFormat": 5, "field": "ref_no", "hasSummary": true},
      {"dataFormat": 5, "field": "invoice_no", "hasSummary": true},
      {"dataFormat": 5, "field": "sku_code", "hasSummary": true},
      {"dataFormat": 5, "field": "inventory_item_name", "hasSummary": true},
      {"dataFormat": 5, "field": "item_category_name", "hasSummary": true},
      {"dataFormat": 5, "field": "unit_name", "hasSummary": true},
      {"dataFormat": 4, "field": "quantity", "hasSummary": true},
      {"dataFormat": 1, "field": "unit_price", "hasSummary": true},
      {"dataFormat": 1, "field": "origin_amount", "hasSummary": true},
      {"dataFormat": 1, "field": "discount_amount", "hasSummary": true},
      {"dataFormat": 1, "field": "total_discount_amount", "hasSummary": true},
      {"dataFormat": 1, "field": "total_revenue", "hasSummary": true},
      {"dataFormat": 1, "field": "tax_amount", "hasSummary": true},
      {"dataFormat": 1, "field": "total_revenue_after_tax", "hasSummary": true},
      {"dataFormat": 1, "field": "cost_of_goods_sold", "hasSummary": true},
      {"dataFormat": 1, "field": "profit", "hasSummary": true},
      {"dataFormat": 5, "field": "customer_code", "hasSummary": true},
      {"dataFormat": 5, "field": "customer_name", "hasSummary": true},
      {"dataFormat": 5, "field": "customer_tel", "hasSummary": true},
      {"dataFormat": 5, "field": "cashier_name", "hasSummary": true},
      {"dataFormat": 5, "field": "channel_name", "hasSummary": true},
      {"dataFormat": 5, "field": "sale_channel_name", "hasSummary": true},
      {"dataFormat": 5, "field": "ecom_order_no", "hasSummary": true},
      {"dataFormat": 5, "field": "delivery_code", "hasSummary": true},
      {"dataFormat": 5, "field": "ecom_return_no", "hasSummary": true}
    ],
    
    // Cấu hình metadata báo cáo của MISA
    reportList: {
      "report_id": "OrderItemRevenueReportDetail",
      "report_name": "SỔ CHI TIẾT BÁN HÀNG",
      "group_id": 2,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_RP_OrderItemRevenue_Detail",
      "function_param_order": "v_session_id,v_from_date,v_to_date,v_is_whole_chain,v_branch_ids,v_channel_id,v_cashier_ids,v_seller_ids,v_customer_ids,v_order_change_date,v_combo_distribute,v_basic_unit_conversion,v_summary_by_order,v_tax_mode,v_skip,v_take,v_where,v_group_column_script,v_group_by_script,v_summary_columns",
      "table_name": "order_item_revenue_report_detail",
      "summary_type": 1,
      "group_summary_type": 1,
      "timeout_report_seconds": 300,
      "report_service_name": "OrderItemRevenueReportDetailService",
      "sort_order": 3,
      "signer_group": 1,
      "inactive": false,
      "load_mode": 2,
      "created_by": "",
      "created_date": "2025-01-17T08:46:25",
      "modified_by": "",
      "modified_date": "2025-01-17T08:46:25"
    }
  }
  
  /* MẪU CẤU HÌNH BÁO CÁO THỨ 2 (Bạn có thể bỏ comment và chỉnh sửa để thêm):
  ,{
    name: "inventory_summary",         // Tên bảng BigQuery mới
    reportId: "InventorySummaryReport",
    dateField: "ref_date",             // Cột ngày để lọc incremental
    uniqueKeys: ["inventory_id"],      // Khóa chính
    parameters: {
      "period": 4,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      // ... các param khác lấy từ file json cURL
    },
    columns: [
      {"dataFormat": 5, "field": "inventory_item_code", "hasSummary": true},
      {"dataFormat": 5, "field": "inventory_item_name", "hasSummary": true},
      // ... các cột khác
    ],
    reportList: {
      "report_id": "InventorySummaryReport",
      // ... các metadata khác của báo cáo
    }
  }
  */
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. TỰ ĐỘNG KHỞI TẠO CẤU TRÚC SHEETS (Chạy 1 lần duy nhất)
// ─────────────────────────────────────────────────────────────────────────────

function setupSheet() {
  // 1. Tạo tab Config
  var configSheet = SPREADSHEET.getSheetByName('Config');
  if (!configSheet) {
    configSheet = SPREADSHEET.insertSheet('Config');
  }
  
  configSheet.clear();
  configSheet.getRange('A1:B5').setValues([
    ['bearer_token', ''],
    ['project_id', 'mira-503005'],
    ['dataset_id', 'mira_data'],
    ['status', 'Chưa chạy'],
    ['last_run', '']
  ]);
  
  configSheet.getRange('A1:A5').setFontWeight('bold').setBackground('#f3f3f3');
  configSheet.getRange('A1:B5').setBorder(true, true, true, true, true, true);
  configSheet.setColumnWidth(1, 150);
  configSheet.setColumnWidth(2, 500);

  // 2. Tạo tab Log
  var logSheet = SPREADSHEET.getSheetByName('Log');
  if (!logSheet) {
    logSheet = SPREADSHEET.insertSheet('Log');
  }
  logSheet.clear();
  logSheet.appendRow(['Thời gian', 'Báo cáo', 'Trạng thái', 'Số bản ghi', 'Chi tiết']);
  logSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#d9ead3');
  logSheet.setColumnWidth(1, 180);
  logSheet.setColumnWidth(2, 150);
  logSheet.setColumnWidth(3, 100);
  logSheet.setColumnWidth(4, 120);
  logSheet.setColumnWidth(5, 300);

  // Xóa tab Sheet1 mặc định nếu có
  var defaultSheet = SPREADSHEET.getSheetByName('Sheet1') || SPREADSHEET.getSheetByName('Trang tính1');
  if (defaultSheet && SPREADSHEET.getSheets().length > 1) {
    try {
      SPREADSHEET.deleteSheet(defaultSheet);
    } catch(e) {}
  }
  
  SpreadsheetApp.getUi().alert('Hệ thống MIRA: Khởi tạo cấu trúc Sheets thành công! Hãy điền cấu hình và token vào tab Config.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CẤU HÌNH & TIỆN ÍCH HỆ THỐNG
// ─────────────────────────────────────────────────────────────────────────────

function getConfig() {
  var sheet = SPREADSHEET.getSheetByName('Config');
  if (!sheet) {
    throw new Error('Không tìm thấy tab "Config" trong Google Sheets.');
  }
  return {
    token:      sheet.getRange('B1').getValue().toString().trim(),
    projectId:  sheet.getRange('B2').getValue().toString().trim(),
    datasetId:  sheet.getRange('B3').getValue().toString().trim()
  };
}

function writeLog(jobName, status, records, message) {
  var sheet = SPREADSHEET.getSheetByName('Log');
  if (!sheet) {
    sheet = SPREADSHEET.insertSheet('Log');
    sheet.appendRow(['Thời gian', 'Báo cáo', 'Trạng thái', 'Số bản ghi', 'Chi tiết']);
  }
  sheet.appendRow([new Date(), jobName, status, records, message]);
}

function updateGlobalStatus(message) {
  var configSheet = SPREADSHEET.getSheetByName('Config');
  if (configSheet) {
    configSheet.getRange('B4').setValue(message);
    configSheet.getRange('B5').setValue(new Date());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRUY VẤN MỐC THỜI GIAN LỚN NHẤT TỪ BIGQUERY (INCREMENTAL)
// ─────────────────────────────────────────────────────────────────────────────

function getMaxDateFromBQ(cfg, job) {
  var sql = `
    SELECT MAX(${job.dateField}) as max_date 
    FROM \`${cfg.projectId}.${cfg.datasetId}.${job.name}\`
  `;
  
  try {
    var queryRequest = {
      query: sql,
      useLegacySql: false
    };
    var queryResults = BigQuery.Jobs.query(queryRequest, cfg.projectId);
    
    if (queryResults.rows && queryResults.rows[0].f[0].v !== null) {
      var maxDateStr = queryResults.rows[0].f[0].v;
      var cleanDate = maxDateStr.split('.')[0];
      if (cleanDate.indexOf('T') !== -1 && !cleanDate.endsWith('Z')) {
        return cleanDate + '.000Z';
      }
      return cleanDate;
    }
  } catch (e) {
    Logger.log(`[${job.name}] Bảng chưa có dữ liệu hoặc lỗi truy vấn: ` + e.message);
  }
  return '2025-10-27T17:00:00.000Z'; // Mốc bắt đầu mặc định
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXTRACT - FETCH DATA TỪ MISA API
// ─────────────────────────────────────────────────────────────────────────────

function fetchMisaData(token, fromDate, job) {
  var apiUrl = 'https://eshopapp.misa.vn/g1/api/report/dynamic/paging-filter';
  var allRecords = [];
  var skip = 0;
  var take = 500;
  var toDate = new Date().toISOString();
  
  // Clone parameters và đè từ ngày/đến ngày
  var reportParams = JSON.parse(JSON.stringify(job.parameters));
  reportParams["v_from_date"] = fromDate;
  reportParams["v_to_date"] = toDate;
  
  var encodedParams = Utilities.base64Encode(JSON.stringify(reportParams), Utilities.Charset.UTF_8);

  var headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en,vi;q=0.9",
    "authorization": "Bearer " + token,
    "content-type": "application/json",
    "origin": "https://eshopapp.misa.vn",
    "referer": "https://eshopapp.misa.vn/management/rp/RPDynamicViewer/" + job.reportId,
    "x-deviceid": "9bd1e690-ff58-44f8-bf24-5ac0085f382e",
    "x-ems-context": "{\"dbid\":\"7c06c972-5014-46e6-a8f8-d5c11767dca4\",\"tid\":\"65589cba-5286-4dc8-a727-a7f5d8fe36c4\",\"tco\":\"ctttmvdvmg92\",\"lang\":\"vi\",\"brid\":\"a38f9189-ad87-11ef-a35e-005056b28600\",\"shtype\":3,\"ica\":false}",
    "x-ms-bid": "a38f9189-ad87-11ef-a35e-005056b28600",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  };

  while (true) {
    var payload = {
      "report_id": job.reportId,
      "report_load_type": 1,
      "parameters": encodedParams,
      "columns": JSON.stringify(job.columns),
      "report_list": job.reportList,
      "is_export": false,
      "skip": skip,
      "take": take
    };

    var options = {
      "method": "post",
      "headers": headers,
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (responseCode === 401 || responseCode === 422) {
      throw new Error('TOKEN_EXPIRED: Token hết hạn (401/422).');
    }

    if (responseCode !== 200) {
      throw new Error('MISA API Error (' + responseCode + '): ' + responseText.substring(0, 300));
    }

    var resJson = JSON.parse(responseText);
    var rows = extractRows(resJson);

    if (!rows || rows.length === 0) {
      break;
    }

    allRecords = allRecords.concat(rows);
    Logger.log(`[${job.name}] Đã tải: ` + allRecords.length + ' records (Skip: ' + skip + ')');

    if (rows.length < take) {
      break;
    }

    skip += take;
    Utilities.sleep(300);
  }

  return allRecords;
}

function extractRows(resData) {
  if (Array.isArray(resData)) return resData;
  if (typeof resData === 'object' && resData !== null) {
    var checkKeys = ['data', 'Data', 'rows', 'Rows', 'results', 'Results', 'items', 'Items'];
    for (var i = 0; i < checkKeys.length; i++) {
      var key = checkKeys[i];
      if (key in resData) {
        var val = resData[key];
        if (Array.isArray(val)) return val;
        if (typeof val === 'object') {
          var sub = extractRows(val);
          if (sub) return sub;
        }
      }
    }
    for (var k in resData) {
      if (Array.isArray(resData[k]) && resData[k].length > 0 && typeof resData[k][0] === 'object') {
        return resData[k];
      }
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LOAD & MERGE VÀO GOOGLE BIGQUERY (DÙNG STAGING TABLE VÀ DML)
// ─────────────────────────────────────────────────────────────────────────────

function mergeIntoBigQuery(cfg, records, job) {
  if (!records || records.length === 0) return 0;

  var targetTableId = job.name;
  var stagingTableId = targetTableId + '_staging_tmp';

  var targetTable = BigQuery.Tables.get(cfg.projectId, cfg.datasetId, targetTableId);
  var targetSchema = targetTable.schema;
  var fields = targetSchema.fields.map(function(f) { return f.name; });

  var newlineJsonString = records.map(function(row) {
    var cleanRow = {};
    targetSchema.fields.forEach(function(field) {
      var val = row[field.name];
      if (val === undefined || val === null || val === '') {
        cleanRow[field.name] = null;
      } else if (field.type === 'FLOAT' || field.type === 'INTEGER') {
        cleanRow[field.name] = Number(val);
      } else {
        cleanRow[field.name] = val.toString();
      }
    });
    return JSON.stringify(cleanRow);
  }).join('\n');

  var dataBlob = Utilities.newBlob(newlineJsonString, 'application/octet-stream');

  var jobConfig = {
    configuration: {
      load: {
        destinationTable: {
          projectId: cfg.projectId,
          datasetId: cfg.datasetId,
          tableId: stagingTableId
        },
        schema: targetSchema,
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_TRUNCATE'
      }
    }
  };

  Logger.log(`[${job.name}] Load staging table: ` + stagingTableId);
  var loadJob = BigQuery.Jobs.insert(jobConfig, cfg.projectId, dataBlob);
  
  var jobId = loadJob.jobReference.jobId;
  while (true) {
    var status = BigQuery.Jobs.get(cfg.projectId, jobId).status;
    if (status.state === 'DONE') {
      if (status.errorResult) {
        throw new Error('Lỗi load Staging: ' + status.errorResult.message);
      }
      break;
    }
    Utilities.sleep(1000);
  }

  var onClause = job.uniqueKeys.map(function(k) { return `T.\`${k}\` = S.\`${k}\``; }).join(' AND ');
  var updateSet = fields.map(function(f) { return `T.\`${f}\` = S.\`${f}\``; }).join(', ');
  var insFields = fields.map(function(f) { return `\`${f}\``; }).join(', ');
  var insValues = fields.map(function(f) { return `S.\`${f}\``; }).join(', ');

  var mergeSql = `
    MERGE \`${cfg.projectId}.${cfg.datasetId}.${targetTableId}\` T
    USING \`${cfg.projectId}.${cfg.datasetId}.${stagingTableId}\` S
    ON ${onClause}
    WHEN MATCHED THEN
      UPDATE SET ${updateSet}
    WHEN NOT MATCHED THEN
      INSERT (${insFields}) VALUES (${insValues})
  `;

  Logger.log(`[${job.name}] MERGE into target table...`);
  var queryRequest = {
    query: mergeSql,
    useLegacySql: false
  };
  var queryJob = BigQuery.Jobs.query(queryRequest, cfg.projectId);
  
  try {
    BigQuery.Tables.remove(cfg.projectId, cfg.datasetId, stagingTableId);
    Logger.log(`[${job.name}] Cleaned staging table.`);
  } catch (e) {
    Logger.log('Lỗi xóa bảng tạm: ' + e.message);
  }

  return records.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HÀM ĐIỀU PHỐI CHÍNH (VÒNG LẶP CHẠY TẤT CẢ CÁC JOBS CẤU HÌNH)
// ─────────────────────────────────────────────────────────────────────────────

function runPipeline() {
  var cfg;
  try {
    cfg = getConfig();
  } catch (e) {
    Logger.log('Lỗi cấu hình: ' + e.message);
    return;
  }

  Logger.log('=== Khởi động MIRA Multi-Job Pipeline ===');
  
  if (!cfg.token) {
    updateGlobalStatus('❌ Thiếu Token MISA');
    return;
  }

  var totalJobs = JOBS.length;
  var successCount = 0;
  var errorList = [];

  for (var i = 0; i < totalJobs; i++) {
    var job = JOBS[i];
    Logger.log(`\n--- Bắt đầu chạy Job [${i + 1}/${totalJobs}]: ${job.name} ---`);
    
    try {
      // Step 1: Lấy mốc thời gian lớn nhất từ BigQuery
      var fromDate = getMaxDateFromBQ(cfg, job);
      Logger.log(`[${job.name}] Mốc cuốn chiếu: ${fromDate}`);

      // Step 2: Kéo dữ liệu từ MISA
      var records = fetchMisaData(cfg.token, fromDate, job);
      Logger.log(`[${job.name}] Kéo được ${records.length} dòng mới`);

      if (records.length === 0) {
        writeLog(job.name, 'NO_DATA', 0, 'Dữ liệu đã mới nhất.');
        successCount++;
        continue;
      }

      // Step 3: Ghi dữ liệu vào BigQuery (UPSERT)
      var upsertedCount = mergeIntoBigQuery(cfg, records, job);
      
      writeLog(job.name, 'SUCCESS', upsertedCount, 'Đồng bộ thành công.');
      successCount++;
      
    } catch (error) {
      var errMsg = error.message;
      Logger.log(`[${job.name}] ❌ Lỗi: ` + errMsg);
      writeLog(job.name, 'ERROR', 0, errMsg);
      errorList.push(`${job.name}: ${errMsg}`);
    }
  }

  // Cập nhật trạng thái tổng thể lên Config Tab
  if (successCount === totalJobs) {
    updateGlobalStatus(`✅ Thành công ${successCount}/${totalJobs} báo cáo`);
  } else {
    updateGlobalStatus(`⚠️ Lỗi ${totalJobs - successCount}/${totalJobs} báo cáo. Chi tiết tại tab Log.`);
  }
}
