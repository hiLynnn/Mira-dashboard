/**
 * MISA eShop to Google BigQuery Auto Pipeline
 * Author: Antigravity AI
 * 
 * HƯỚNG DẪN THIẾT LẬP NHANH:
 * 1. Tạo 1 file Google Sheets mới.
 * 2. Vào Extensions -> Apps Script. Xóa hết code cũ và dán toàn bộ file này vào.
 * 3. Trong phần Services bên trái (nhấn dấu +) -> Thêm dịch vụ "BigQuery API".
 * 4. Nhấp chọn hàm "setupSheet" trên thanh công cụ và nhấn "Run" để khởi tạo cấu trúc bảng tính tự động.
 * 5. Cấu hình Tab "Config" hiển thị trên Google Sheet: dán token MISA, project ID, dataset ID.
 * 6. Tạo Trigger chạy tự động hàm "runPipeline" hàng ngày lúc 7:00 sáng.
 */

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// ─────────────────────────────────────────────────────────────────────────────
// 0. TỰ ĐỘNG KHỞI TẠO CẤU TRÚC SHEETS (Chạy 1 lần duy nhất)
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
  
  // Định dạng thẩm mỹ cho tab Config
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
  logSheet.setColumnWidth(2, 120);
  logSheet.setColumnWidth(3, 100);
  logSheet.setColumnWidth(4, 120);
  logSheet.setColumnWidth(5, 300);

  // Xóa tab Sheet1 mặc định nếu có để làm sạch file tính
  var defaultSheet = SPREADSHEET.getSheetByName('Sheet1') || SPREADSHEET.getSheetByName('Trang tính1');
  if (defaultSheet && SPREADSHEET.getSheets().length > 1) {
    try {
      SPREADSHEET.deleteSheet(defaultSheet);
    } catch(e) {}
  }
  
  SpreadsheetApp.getUi().alert('Hệ thống MIRA: Khởi tạo cấu trúc Sheets thành công! Hãy điền cấu hình và token vào tab Config.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CẤU HÌNH & TIỆN ÍCH HỆ THỐNG
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

function writeLog(status, records, message) {
  var sheet = SPREADSHEET.getSheetByName('Log');
  if (!sheet) {
    sheet = SPREADSHEET.insertSheet('Log');
    sheet.appendRow(['Thời gian', 'Báo cáo', 'Trạng thái', 'Số bản ghi', 'Chi tiết']);
  }
  sheet.appendRow([new Date(), 'order_detail', status, records, message]);
  
  var configSheet = SPREADSHEET.getSheetByName('Config');
  if (configSheet) {
    configSheet.getRange('B4').setValue(status === 'SUCCESS' ? '✅ Thành công (' + records + ' dòng)' : '❌ Lỗi: ' + message);
    configSheet.getRange('B5').setValue(new Date());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRUY VẤN MỐC THỜI GIAN LỚN NHẤT TỪ BIGQUERY (INCREMENTAL)
// ─────────────────────────────────────────────────────────────────────────────

function getMaxDateFromBQ(cfg) {
  var tableId = 'order_detail';
  var sql = `
    SELECT MAX(order_date) as max_date 
    FROM \`${cfg.projectId}.${cfg.datasetId}.${tableId}\`
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
    Logger.log('Bảng chưa có dữ liệu hoặc lỗi truy vấn: ' + e.message);
  }
  return '2025-10-27T17:00:00.000Z'; // Fallback ngày bắt đầu mặc định
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXTRACT - FETCH DATA TỪ MISA API
// ─────────────────────────────────────────────────────────────────────────────

function fetchMisaData(token, fromDate) {
  var apiUrl = 'https://eshopapp.misa.vn/g1/api/report/dynamic/paging-filter';
  var allRecords = [];
  var skip = 0;
  var take = 500;
  var toDate = new Date().toISOString();
  
  var reportParams = {
    "period": 4,
    "v_is_whole_chain": false,
    "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
    "v_show_branch": false,
    "v_from_date": fromDate,
    "v_to_date": toDate,
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
  };
  
  var encodedParams = Utilities.base64Encode(JSON.stringify(reportParams), Utilities.Charset.UTF_8);
  
  var columns = [
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
  ];
  
  var reportList = {
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
  };

  var headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en,vi;q=0.9",
    "authorization": "Bearer " + token,
    "content-type": "application/json",
    "origin": "https://eshopapp.misa.vn",
    "referer": "https://eshopapp.misa.vn/management/rp/RPDynamicViewer/OrderItemRevenueReportDetail",
    "x-deviceid": "9bd1e690-ff58-44f8-bf24-5ac0085f382e",
    "x-ems-context": "{\"dbid\":\"7c06c972-5014-46e6-a8f8-d5c11767dca4\",\"tid\":\"65589cba-5286-4dc8-a727-a7f5d8fe36c4\",\"tco\":\"ctttmvdvmg92\",\"lang\":\"vi\",\"brid\":\"a38f9189-ad87-11ef-a35e-005056b28600\",\"shtype\":3,\"ica\":false}",
    "x-ms-bid": "a38f9189-ad87-11ef-a35e-005056b28600",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  };

  while (true) {
    var payload = {
      "report_id": "OrderItemRevenueReportDetail",
      "report_load_type": 1,
      "parameters": encodedParams,
      "columns": JSON.stringify(columns),
      "report_list": reportList,
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
      throw new Error('TOKEN_EXPIRED: Token hết hạn (401/422). Vui lòng cập nhật Token mới!');
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
    Logger.log('Đã tải: ' + allRecords.length + ' records (Skip: ' + skip + ')');

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
// 4. LOAD & MERGE VÀO GOOGLE BIGQUERY (DÙNG STAGING TABLE VÀ DML)
// ─────────────────────────────────────────────────────────────────────────────

function mergeIntoBigQuery(cfg, records) {
  if (!records || records.length === 0) return 0;

  var targetTableId = 'order_detail';
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

  Logger.log('Đang load data lên staging table: ' + stagingTableId);
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
  Logger.log('Tải staging table hoàn thành.');

  var uniqueKeys = ['order_detail_id'];
  var onClause = uniqueKeys.map(function(k) { return `T.\`${k}\` = S.\`${k}\``; }).join(' AND ');
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

  Logger.log('Bắt đầu MERGE vào bảng chính...');
  var queryRequest = {
    query: mergeSql,
    useLegacySql: false
  };
  var queryJob = BigQuery.Jobs.query(queryRequest, cfg.projectId);
  
  try {
    BigQuery.Tables.remove(cfg.projectId, cfg.datasetId, stagingTableId);
    Logger.log('Đã xóa bảng tạm Staging.');
  } catch (e) {
    Logger.log('Lỗi xóa bảng tạm: ' + e.message);
  }

  return records.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HÀM ĐIỀU PHỐI CHÍNH (CHẠY 24H)
// ─────────────────────────────────────────────────────────────────────────────

function runPipeline() {
  var cfg;
  try {
    cfg = getConfig();
  } catch (e) {
    Logger.log('Lỗi cấu hình: ' + e.message);
    return;
  }

  Logger.log('=== Khởi động MISA → BigQuery Sync pipeline ===');
  
  try {
    if (!cfg.token) {
      throw new Error('Thiếu token MISA trong Config! Vui lòng cập nhật.');
    }

    var fromDate = getMaxDateFromBQ(cfg);
    Logger.log('Mốc cuốn chiếu từ: ' + fromDate);

    var records = fetchMisaData(cfg.token, fromDate);
    Logger.log('Tổng records lấy về từ MISA: ' + records.length);

    if (records.length === 0) {
      writeLog('NO_DATA', 0, 'Dữ liệu đã mới nhất, không có bản ghi mới.');
      return;
    }

    var upsertedCount = mergeIntoBigQuery(cfg, records);
    writeLog('SUCCESS', upsertedCount, 'Đồng bộ thành công.');

  } catch (error) {
    var errMsg = error.message;
    writeLog('ERROR', 0, errMsg);
  }
}
