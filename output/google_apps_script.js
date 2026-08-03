/**
 * MISA eShop to Google BigQuery Auto Pipeline (Multi-Job Version)
 * Author: Linh
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
      { "dataFormat": 6, "field": "order_date", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_no", "hasSummary": true },
      { "dataFormat": 5, "field": "invoice_no", "hasSummary": true },
      { "dataFormat": 5, "field": "sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "item_category_name", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 4, "field": "quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "unit_price", "hasSummary": true },
      { "dataFormat": 1, "field": "origin_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "discount_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "total_discount_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "total_revenue", "hasSummary": true },
      { "dataFormat": 1, "field": "tax_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "total_revenue_after_tax", "hasSummary": true },
      { "dataFormat": 1, "field": "cost_of_goods_sold", "hasSummary": true },
      { "dataFormat": 1, "field": "profit", "hasSummary": true },
      { "dataFormat": 5, "field": "customer_code", "hasSummary": true },
      { "dataFormat": 5, "field": "customer_name", "hasSummary": true },
      { "dataFormat": 5, "field": "customer_tel", "hasSummary": true },
      { "dataFormat": 5, "field": "cashier_name", "hasSummary": true },
      { "dataFormat": 5, "field": "channel_name", "hasSummary": true },
      { "dataFormat": 5, "field": "sale_channel_name", "hasSummary": true },
      { "dataFormat": 5, "field": "ecom_order_no", "hasSummary": true },
      { "dataFormat": 5, "field": "delivery_code", "hasSummary": true },
      { "dataFormat": 5, "field": "ecom_return_no", "hasSummary": true }
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
  },
  {
    // Báo cáo số 2: Tổng hợp tồn kho (inventory_summary)
    name: "inventory_summary",
    reportId: "InventorySummaryReport",
    dateField: "",     // Báo cáo snapshot không lọc incremental theo ngày
    isSnapshot: true,  // Mỗi lần chạy sẽ xóa sạch và nạp lại toàn bộ (WRITE_TRUNCATE)
    uniqueKeys: ["inventory_item_code", "branch_name", "stock_name"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_view_detail_by_stock": true,
      "v_show_inventory_by_stock": false,
      "v_all_check_seller": 1,
      "v_stock_ids": null,
      "v_lst_warehouse_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_is_refresh": false,
      "v_session_key": "1dd9b9f965752139bece0057892804e91bbb5431edec656ad0f92fbe8382e2c3"
    },
     columns: [
       { "dataFormat": 5, "field": "session_id", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_code", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
       { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
       { "dataFormat": 5, "field": "stock_name", "hasSummary": true },
       { "dataFormat": 4, "field": "opening_quantity", "hasSummary": true },
       { "dataFormat": 1, "field": "opening_amount", "hasSummary": true },
       { "dataFormat": 4, "field": "inward_quantity", "hasSummary": true },
       { "dataFormat": 1, "field": "inward_amount", "hasSummary": true },
       { "dataFormat": 4, "field": "outward_quantity", "hasSummary": true },
       { "dataFormat": 1, "field": "outward_amount", "hasSummary": true },
       { "dataFormat": 4, "field": "closing_quantity", "hasSummary": true },
       { "dataFormat": 1, "field": "closing_amount", "hasSummary": true },
       { "dataFormat": 4, "field": "detail_id", "hasSummary": true },
       { "dataFormat": 4, "field": "is_parent", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_id", "hasSummary": true },
       { "dataFormat": 5, "field": "parent_id", "hasSummary": true },
       { "dataFormat": 4, "field": "grade", "hasSummary": true },
       { "dataFormat": 3, "field": "is_bold", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_summary_report_id", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_code_parent", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_name_parent", "hasSummary": true },
       { "dataFormat": 5, "field": "inventory_item_category_name", "hasSummary": true },
       { "dataFormat": 5, "field": "brand_name", "hasSummary": true },
       { "dataFormat": 5, "field": "vendor_name_list", "hasSummary": true },
       { "dataFormat": 5, "field": "stock_id", "hasSummary": true },
       { "dataFormat": 5, "field": "branch_id", "hasSummary": true },
       { "dataFormat": 5, "field": "branch_name", "hasSummary": true }
     ],
    reportList: {
      "report_id": "InventorySummaryReport",
      "report_name": "TỔNG HỢP TỒN KHO",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_InventorySummaryReport",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_stock_ids, v_lst_warehouse_name, v_view_detail_by_stock, v_show_inventory_by_stock, v_branch_ids",
      "parameter_form_name": "inventory-summary-report/InventorySummaryReportParam",
      "parameter_viewer": "/inventory-summary-report/InventorySummaryReportViewer",
      "link_to_report_detail": "{\n    \"report_id\": \"DetailedInventoryInboundReportParam\",\n    \"parameters\": {\n        \"v_from_date\": \"reportParam.v_from_date\",\n        \"v_to_date\": \"reportParam.v_to_date\", \n        \"v_stock_ids\": \"reportParam.v_stock_ids\",\n        \"v_inventory_category_ids\": \"reportParam.v_inventory_category_ids\",\n        \"v_inventory_ids\": \"currentRow.inventory_item_id\",\n        \"v_branch_ids\": \"currentRow.branch_id\",\n        \"v_view_detail_by_stock\": \"reportParam.v_view_detail_by_stock\",\n        \"v_show_inventory_by_stock\": \"reportParam.v_show_inventory_by_stock\",\n  \"v_lst_warehouse_name\": \"currentRow.stock_name\",\n  \"v_lst_inventory_name\": \"currentRow.inventory_item_name\"\n    },\n    \"reportSubTitleParam\": [\n        {\n            \"key\": \"v_lst_warehouse_name\", \n            \"value\": \"currentRow.stock_name\"\n        },\n        {\n            \"key\": \"v_lst_inventory_name\",\n            \"value\": \"currentRow.inventory_item_code\"\n        }\n    ]\n}",
      "preview_image": "report-InventorySummaryReport-bg",
      "table_name": "inventory_summary_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "report_service_name": "InventorySummaryReportService",
      "sort_order": 22,
      "signer_group": 1,
      "inactive": false,
      "load_mode": 1,
      "created_by": "",
      "created_date": "2025-04-08T17:49:42",
      "modified_by": "",
      "modified_date": "2025-04-08T17:49:42"
    }
  },
  {
    // Báo cáo số 3: Chi tiết nhập xuất tồn kho theo hàng hóa (detailed_inventory_inbound)
    name: "detailed_inventory_inbound",
    reportId: "DetailedInventoryInboundReportParam",
    dateField: "ref_date",
    uniqueKeys: ["inventory_summary_report_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_view_detail_by_stock": true,
      "v_show_inventory_by_stock": false,
      "v_all_check_seller": 1,
      "v_stock_ids": null,
      "cache_inventoryGrid": "[]",
      "v_lst_warehouse_name": "Tất cả",
      "v_inventory_category_ids": null,
      "v_lst_category_name": "Tất cả",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_is_refresh": false,
      "v_session_key": "7c3daee7c6a10daaaa2a5f0dbc8610d85b3f7338fcccc0bc4394834dc4d6a3c9"
    },
    columns: [
      { "dataFormat": 5, "field": "session_id", "hasSummary": true },
      { "dataFormat": 5, "field": "sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 5, "field": "stock_code", "hasSummary": true },
      { "dataFormat": 5, "field": "stock_name", "hasSummary": true },
      { "dataFormat": 4, "field": "opening_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "opening_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "inward_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "inward_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "outward_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "outward_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "closing_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "closing_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "detail_id", "hasSummary": true },
      { "dataFormat": 4, "field": "is_parent", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_id", "hasSummary": true },
      { "dataFormat": 5, "field": "parent_id", "hasSummary": true },
      { "dataFormat": 4, "field": "grade", "hasSummary": true },
      { "dataFormat": 3, "field": "is_bold", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_summary_report_id", "hasSummary": true },
      { "dataFormat": 6, "field": "ref_date", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_no", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_id", "hasSummary": true },
      { "dataFormat": 4, "field": "ref_type", "hasSummary": true },
      { "dataFormat": 5, "field": "account_object_name", "hasSummary": true },
      { "dataFormat": 5, "field": "parent_name", "hasSummary": true },
      { "dataFormat": 5, "field": "parent_sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_category_name", "hasSummary": true },
      { "dataFormat": 5, "field": "reference_ref_nos", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_type_description", "hasSummary": true },
      { "dataFormat": 5, "field": "branch_id", "hasSummary": true },
      { "dataFormat": 5, "field": "branch_name", "hasSummary": true }
    ],
    reportList: {
      "report_id": "DetailedInventoryInboundReportParam",
      "report_name": "CHI TIẾT NHẬP XUẤT TỒN KHO THEO HÀNG HÓA",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_DetailedInventoryInboundReport",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_stock_ids, v_lst_warehouse_name, v_inventory_category_ids, v_lst_category_name, v_inventory_ids, v_show_inventory_by_stock, v_branch_ids",
      "parameter_form_name": "detailed-inventory-inbound-report/DetailedInventoryInboundReportParam",
      "parameter_viewer": "/detailed-inventory-inbound-report/DetailedInventoryInboundReportViewer",
      "preview_image": "report-DetailedInventoryInboundReport-bg",
      "table_name": "detailed_inventory_inbound_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "timeout_report_seconds": 300,
      "report_service_name": "DetailedInventoryInboundReportService",
      "sort_order": 23,
      "signer_group": 1,
      "inactive": false,
      "load_mode": 1,
      "created_by": "",
      "created_date": "2025-07-14T13:41:30",
      "modified_by": "",
      "modified_date": "2025-07-14T13:41:30"
    }
  },
  {
    name: "purchase_detail_ledger",
    reportId: "PurchaseDetailLedgerReport",
    dateField: "ref_date",
    uniqueKeys: ["purchase_detail_ledger_report_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "cache_inventoryGrid": null,
      "isSelectAllInventoryItem_cached": true,
      "v_inventory_item_ids": null,
      "v_vendor_ids": null,
      "v_vendors": null,
      "v_inventory_item_category_ids": null,
      "v_vendor_category_ids": null,
      "v_stock_ids": null,
      "v_is_refresh": false,
      "v_session_key": "6099618e724ffab483f6148fbe0367d9ae06cc625698db57c9dc81cfde725573"
    },
    columns: [
      { "dataFormat": 6, "field": "ref_date", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_type_name", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_no", "hasSummary": true },
      { "dataFormat": 5, "field": "stock_code", "hasSummary": true },
      { "dataFormat": 5, "field": "stock_name", "hasSummary": true },
      { "dataFormat": 5, "field": "sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 4, "field": "purchase_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "purchase_unit_price", "hasSummary": false },
      { "dataFormat": 1, "field": "purchase_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "sales_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "sales_unit_price", "hasSummary": false },
      { "dataFormat": 1, "field": "sales_amount", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_category_name", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_model_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_model_name", "hasSummary": true },
      { "dataFormat": 5, "field": "account_object_code", "hasSummary": true },
      { "dataFormat": 5, "field": "account_object_name", "hasSummary": true },
      { "dataFormat": 5, "field": "journal_memo", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_no_finance", "hasSummary": true },
      { "dataFormat": 5, "field": "branch_name", "hasSummary": true }
    ],
    reportList: {
      "report_id": "PurchaseDetailLedgerReport",
      "report_name": "SO CHI TIET MUA HANG",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_PurchaseDetailLedgerReport",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_is_whole_chain, v_branch_ids, v_stock_ids, v_inventory_item_category_ids, v_inventory_item_ids, v_vendor_ids, v_vendor_category_ids",
      "parameter_form_name": "purchase-detail-ledger-report/PurchaseDetailLedgerReportParam",
      "table_name": "purchase_detail_ledger_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "report_service_name": "PurchaseDetailLedgerReportService",
      "sort_order": 24,
      "signer_group": 1,
      "inactive": false,
      "load_mode": 1,
      "created_by": "",
      "created_date": "2025-01-17T08:46:25",
      "modified_by": "",
      "modified_date": "2025-01-17T08:46:25"
    }
  },
  {
    name: "debt_vendor",
    reportId: "DebtVendorReport",
    dateField: "ref_date",
    uniqueKeys: ["debt_vendor_report_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_lst_vendor_category_ids": null,
      "v_lst_category_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_is_refresh": false,
      "v_session_key": "85a0c64184135fc5d596b3ede57e7a07e582697a8427877387814fa94a20de30"
    },
    columns: [
      { "dataFormat": 5, "field": "account_object_code", "hasSummary": true },
      { "dataFormat": 5, "field": "account_object_name", "hasSummary": true },
      { "dataFormat": 5, "field": "tel", "hasSummary": true },
      { "dataFormat": 5, "field": "vendor_category_name", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_opening_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_increment_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_decrement_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_closing_amount", "hasSummary": true }
    ],
    reportList: {
      "report_id": "DebtVendorReport",
      "report_name": "BAO CAO CONG NO NHA CUNG CAP",
      "group_id": 8,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_DebtVendorReport",
      "function_param_order": "v_session_id,v_period,v_from_date,v_to_date, v_is_whole_chain, v_branch_ids, v_lst_vendor_category_ids, v_lst_category_name",
      "parameter_form_name": "debt-vendor-report/DebtVendorReportParam",
      "table_name": "debt_vendor_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "timeout_report_seconds": 300,
      "load_mode": 1
    }
  },
  {
    name: "debt_vendor_detail",
    reportId: "DebtVendorReportDetail",
    dateField: "ref_date",
    uniqueKeys: ["debt_report_detail_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "cache_vendorGrid": "[]",
      "v_vendor_ids": null,
      "v_lst_vendor_name": "Tất cả",
      "v_get_all_vendor": 1,
      "v_is_refresh": false,
      "v_session_key": "e71d5d5f1dc8840ace16373e3d640b82fa376fc8b4758d5d93a8341ee5b5fe2b"
    },
    columns: [
      { "dataFormat": 6, "field": "ref_date", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_no", "hasSummary": true },
      { "dataFormat": 5, "field": "ref_type", "hasSummary": true },
      { "dataFormat": 5, "field": "description", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_increment_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_decrement_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "debt_opening_amount", "hasSummary": false },
      { "dataFormat": 5, "field": "account_object_name", "hasSummary": true }
    ],
    reportList: {
      "report_id": "DebtVendorReportDetail",
      "report_name": "CHI TIET CONG NO NHA CUNG CAP",
      "group_id": 8,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_DebtVendorReportDetail",
      "function_param_order": "v_session_id,v_from_date,v_to_date,v_is_whole_chain,v_branch_ids,v_lst_vendor_ids, v_get_all_vendor",
      "parameter_form_name": "debt-vendor-report-detail/DebtVendorDetailReportParam",
      "table_name": "debt_vendor_report_detail",
      "summary_type": 1,
      "group_summary_type": 1,
      "timeout_report_seconds": 300,
      "load_mode": 1
    }
  },
  {
    name: "inventory_by_lot",
    reportId: "InventoryByLotSummaryReport",
    dateField: "ref_date",
    uniqueKeys: ["inventory_summary_report_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_view_detail_by_stock": true,
      "v_show_inventory_by_stock": false,
      "v_all_check_seller": 1,
      "v_stock_ids": null,
      "v_lst_warehouse_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_is_refresh": false,
      "v_session_key": "1dd9b9f965752139bece0057892804e91bbb5431edec656ad0f92fbe8382e2c3"
    },
    columns: [
      { "dataFormat": 5, "field": "lot_no", "hasSummary": true },
      { "dataFormat": 6, "field": "expired_date", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_code", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 4, "field": "opening_quantity", "hasSummary": true },
      { "dataFormat": 4, "field": "inward_quantity", "hasSummary": true },
      { "dataFormat": 4, "field": "outward_quantity", "hasSummary": true },
      { "dataFormat": 4, "field": "closing_quantity", "hasSummary": true }
    ],
    reportList: {
      "report_id": "InventoryByLotSummaryReport",
      "report_name": "TONG HOP TON KHO THEO LO",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_InventorySummaryReportByLotNo",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_stock_ids, v_lst_warehouse_name, v_view_detail_by_stock, v_show_inventory_by_stock, v_branch_id",
      "parameter_form_name": "inventory-summary-by-lot-report/InventorySummaryByLotReportParam",
      "table_name": "inventory_summary_report_by_lot",
      "summary_type": 1,
      "group_summary_type": 1,
      "report_service_name": "InventorySummaryReportService",
      "sort_order": 28,
      "load_mode": 1
    }
  },
  {
    name: "summary_inventory_by_expiry_date",
    reportId: "SummaryInventoryByExpiryDate",
    dateField: null,
    isSnapshot: true,  // Snapshot: xóa sạch và nạp lại toàn bộ mỗi lần chạy
    isSummmayParent: true,
    uniqueKeys: ["summary_inventory_by_expiry_date_id"],
    parameters: {
      "period": 8,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_view_detail_by_stock": true,
      "v_show_inventory_by_stock": false,
      "v_all_check_seller": 1,
      "v_stock_ids": null,
      "v_lst_warehouse_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_is_refresh": false,
      "v_session_key": "1f4e3892cc4156dbe7431f66c31057051cdc9a4de29e27d0512d40d849c4cf7"
    },
    columns: [
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_code", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 5, "field": "lot_no", "hasSummary": true },
      { "dataFormat": 6, "field": "expired_date", "hasSummary": true },
      { "dataFormat": 4, "field": "inventory_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "inventory_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "days_remaining", "hasSummary": true },
      { "dataFormat": 4, "field": "days_out", "hasSummary": true },
      { "dataFormat": 7, "field": "status", "hasSummary": true },
      { "dataFormat": 6, "field": "near_expiry_date", "hasSummary": true }
    ],
    reportList: {
      "report_id": "SummaryInventoryByExpiryDate",
      "report_name": "TONG HOP TON KHO THEO HAN SU DUNG",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_SummaryInventoryByExpiryDate",
      "function_param_order": "v_session_id, v_to_date, v_stock_ids, v_lst_warehouse_name, v_view_detail_by_stock, v_show_inventory_by_stock, v_branch_id",
      "parameter_form_name": "summary-inventory-by-expiry-date/SummaryInventoryByExpiryDateParam",
      "table_name": "summary_inventory_by_expiry_date",
      "summary_type": 1,
      "group_summary_type": 1,
      "sort_order": 30,
      "load_mode": 1
    }
  },
  {
    name: "daily_sales_detail",
    reportId: "DailySalesDetailReport",
    dateField: "report_date",
    uniqueKeys: ["daily_sales_detail_report_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_order_date_type": 1,
      "v_all_check_seller": 1,
      "v_channel_ids": "",
      "v_cashier_ids": "All",
      "v_employee_ids": "All",
      "v_customer_ids": "All",
      "channel_names": "Tất cả",
      "cashier_names": "Tất cả",
      "employee_names": "Tất cả",
      "customer_names": "Tất cả",
      "v_connect_status": true,
      "v_is_refresh": false,
      "v_session_key": "dc43b9198d72018a042fa4118ae77f09fb17fc9a4d61e9b6ee1ddd459c104035"
    },
    columns: [
      { "dataFormat": 6, "field": "report_date", "hasSummary": true },
      { "dataFormat": 5, "field": "order_time", "hasSummary": true },
      { "dataFormat": 5, "field": "order_no", "hasSummary": true },
      { "dataFormat": 5, "field": "channel_name", "hasSummary": true },
      { "dataFormat": 7, "field": "order_status", "hasSummary": true },
      { "dataFormat": 1, "field": "total_item_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "total_order_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "revenue", "hasSummary": true },
      { "dataFormat": 1, "field": "vat_amount", "hasSummary": true },
      { "dataFormat": 1, "field": "cash_payment", "hasSummary": true },
      { "dataFormat": 1, "field": "bank_transfer_payment", "hasSummary": true },
      { "dataFormat": 1, "field": "actual_revenue", "hasSummary": true },
      { "dataFormat": 5, "field": "customer_name", "hasSummary": true },
      { "dataFormat": 5, "field": "employee_name", "hasSummary": true },
      { "dataFormat": 5, "field": "cashier_name", "hasSummary": true }
    ],
    reportList: {
      "report_id": "DailySalesDetailReport",
      "report_name": "BANG KE DON HANG",
      "group_id": 2,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_DailySalesDetailReport",
      "function_param_order": "v_session_id,v_from_date,v_to_date,v_order_date_type,v_channel_ids,v_seller_ids,v_cashier_ids,v_employee_ids,v_customer_ids,v_branch_ids",
      "parameter_form_name": "daily-sales-detail-report/DailySalesDetailReportParam",
      "table_name": "daily_sales_detail_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "timeout_report_seconds": 300,
      "load_mode": 1
    }
  },
  {
    name: "summary_inventory_by_order_status",
    reportId: "SummaryInventoryItemByOrderStatus",
    dateField: null,
    isSnapshot: true,  // Snapshot: xóa sạch và nạp lại toàn bộ mỗi lần chạy
    uniqueKeys: ["summary_inventory_by_order_status_id"],
    parameters: {
      "period": 4,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_show_connected_only": 1,
      "v_channel_ids": "All,20,70,30,110,5,120,10,90,50,95",
      "v_shop_ids": "All",
      "v_inventory_category_ids": null,
      "v_tax_mode": 3,
      "v_shop_names": "Tất cả",
      "v_lst_category_name": "Tất cả",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tất cả",
      "v_get_all_item": 1,
      "cache_inventoryGrid": "[]",
      "v_is_refresh": false,
      "v_session_key": "b47a322052bf2b8c1a5a3aafce1b53463edcb55b3eeafd2392da9158e0b5205a"
    },
    columns: [
      { "dataFormat": 5, "field": "sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_category_name", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 4, "field": "sold_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "sold_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "delivery_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "delivery_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "stock_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "stock_amount", "hasSummary": true },
      { "dataFormat": 4, "field": "available_quantity", "hasSummary": true },
      { "dataFormat": 1, "field": "available_amount", "hasSummary": true }
    ],
    reportList: {
      "report_id": "SummaryInventoryItemByOrderStatus",
      "report_name": "TONG HOP HANG HOA THEO TRANG THAI DON HANG",
      "group_id": 2,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_SummaryInventoryItemByOrderStatus",
      "function_param_order": "v_session_id,v_from_date, v_is_whole_chain, v_branch_ids,v_show_connected_only,v_inventory_category_ids,v_inventory_ids,v_get_all_item,v_channel_ids,v_shop_ids",
      "parameter_form_name": "summary-inventory_by_order_status/SummaryInventoryByOrderStatusParam",
      "table_name": "summary_inventory_by_order_status",
      "summary_type": 1,
      "group_summary_type": 1,
      "sort_order": 11,
      "load_mode": 1
    }
  },
  {
    name: "warehouse_storage_time",
    reportId: "WarehouseStorageTimeReport",
    dateField: null,
    isSnapshot: true,  // Snapshot: xóa sạch và nạp lại toàn bộ mỗi lần chạy
    uniqueKeys: ["warehouse_storage_time_report_id"],
    parameters: {
      "period": 8,
      "v_is_whole_chain": false,
      "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_show_branch": false,
      "v_from_date": "2026-06-30T17:00:00.000Z",
      "v_to_date": "2026-07-31T16:59:59.000Z",
      "v_stock_ids": null,
      "v_vendor_ids": null,
      "cache_inventoryGrid": "[]",
      "v_account_object_name": "Tất cả",
      "v_lst_warehouse_name": "Tất cả",
      "v_inventory_category_ids": null,
      "v_lst_category_name": "Tất cả",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tất cả",
      "v_branch_id": "a38f9189-ad87-11ef-a35e-005056b28600",
      "v_is_refresh": false,
      "v_session_key": "987f6ca260108e77201a2f603f00273b721a0305e52af9505bbf65c441348efb"
    },
    columns: [
      { "dataFormat": 5, "field": "sku_code", "hasSummary": true },
      { "dataFormat": 5, "field": "barcode", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_name", "hasSummary": true },
      { "dataFormat": 5, "field": "inventory_item_category_name", "hasSummary": true },
      { "dataFormat": 5, "field": "unit_name", "hasSummary": true },
      { "dataFormat": 1, "field": "latest_inward_unit_price", "hasSummary": false },
      { "dataFormat": 1, "field": "latest_outward_sale_unit_price", "hasSummary": false },
      { "dataFormat": 1, "field": "avg_inward_unit_price", "hasSummary": false },
      { "dataFormat": 1, "field": "avg_outward_sale_unit_price", "hasSummary": false },
      { "dataFormat": 4, "field": "quantity_closing_balance", "hasSummary": true },
      { "dataFormat": 1, "field": "amount_closing_balance", "hasSummary": true },
      { "dataFormat": 6, "field": "first_inward_date", "hasSummary": true },
      { "dataFormat": 6, "field": "latest_inward_date", "hasSummary": true },
      { "dataFormat": 6, "field": "latest_outward_date", "hasSummary": true },
      { "dataFormat": 3, "field": "days_from_first_inward", "hasSummary": false },
      { "dataFormat": 3, "field": "days_from_latest_inward", "hasSummary": false },
      { "dataFormat": 3, "field": "days_from_latest_outward", "hasSummary": false }
    ],
    reportList: {
      "report_id": "WarehouseStorageTimeReport",
      "report_name": "THOI GIAN LUU KHO HANG HOA",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_WarehouseStorageTimeReport",
      "function_param_order": "v_session_id,v_to_date,v_stock_ids,v_inventory_category_ids,v_inventory_ids,v_vendor_ids",
      "parameter_form_name": "warehouse-storage-time-report/WarehouseStorageTimeReportParam",
      "table_name": "warehouse_storage_time_report",
      "summary_type": 1,
      "group_summary_type": 1,
      "sort_order": 40,
      "load_mode": 1
    }
  }
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
    ['project_id', 'mira-503910'],
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
    } catch (e) { }
  }

  // 3. Tự động cài đặt trigger chạy định kỳ
  setupTriggers();

  try {
    SpreadsheetApp.getUi().alert('Hệ thống MIRA: Khởi tạo thành công! Trigger 4h/lần đã được cài đặt. Hãy điền token vào tab Config.');
  } catch (e) {
    Logger.log('Khởi tạo cấu trúc Sheets thành công!');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1B. QUẢN LÝ TRIGGER TỰ ĐỘNG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Xóa tất cả trigger cũ cho runPipeline và tạo lại trigger chạy mỗi 4 tiếng.
 * Gọi hàm này thủ công hoặc qua setupSheet() để cài đặt lịch chạy tự động.
 */
function setupTriggers() {
  // Xóa tất cả trigger cũ của runPipeline để tránh trùng lặp
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    if (t.getHandlerFunction() === 'runPipeline') {
      ScriptApp.deleteTrigger(t);
      Logger.log('Đã xóa trigger cũ: ' + t.getUniqueId());
    }
  }

  // Tạo trigger mới: chạy runPipeline() mỗi 4 tiếng
  ScriptApp.newTrigger('runPipeline')
    .timeBased()
    .everyHours(4)
    .create();

  Logger.log('✅ Đã cài đặt trigger tự động: runPipeline() mỗi 4 tiếng.');
}

/**
 * Tạo one-time trigger để chạy runPipeline() sau 1 phút (async).
 * Dùng trong doPost() để tránh timeout 30s của Web App.
 */
function triggerPipelineAsync() {
  // Xóa các pending one-time trigger cũ (nếu có) để tránh chồng chất
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    if (t.getHandlerFunction() === 'runPipeline' && t.getTriggerSource() === ScriptApp.TriggerSource.CLOCK) {
      var triggerType = t.getEventType();
      // Chỉ xóa one-time trigger (CLOCK + AT_SPECIFIC_DATE_TIME), giữ lại periodic trigger
      if (triggerType === ScriptApp.EventType.AT_SPECIFIC_DATE_TIME) {
        ScriptApp.deleteTrigger(t);
        Logger.log('Đã xóa pending one-time trigger cũ: ' + t.getUniqueId());
      }
    }
  }

  // Tạo one-time trigger: chạy runPipeline() sau 1 phút
  var runAt = new Date(new Date().getTime() + 60 * 1000); // +1 phút
  ScriptApp.newTrigger('runPipeline')
    .timeBased()
    .at(runAt)
    .create();

  Logger.log('✅ Đã lên lịch chạy pipeline async lúc: ' + runAt.toISOString());
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
    token: sheet.getRange('B1').getValue().toString().trim(),
    projectId: sheet.getRange('B2').getValue().toString().trim(),
    datasetId: sheet.getRange('B3').getValue().toString().trim()
  };
}

function writeLog(jobName, status, records, message) {
  var sheet = SPREADSHEET.getSheetByName('Log');
  if (!sheet) {
    sheet = SPREADSHEET.insertSheet('Log');
    sheet.appendRow(['Thời gian', 'Báo cáo', 'Trạng thái', 'Số bản ghi', 'Chi tiết']);
  }
  sheet.appendRow([new Date(), jobName, status, records, message]);
  SpreadsheetApp.flush();
}

function updateGlobalStatus(message) {
  var configSheet = SPREADSHEET.getSheetByName('Config');
  if (configSheet) {
    var data = configSheet.getRange('A1:A10').getValues();
    var statusRow = 4;
    var lastRunRow = 5;
    for (var i = 0; i < data.length; i++) {
      var key = data[i][0] ? data[i][0].toString().trim() : '';
      if (key === 'status') statusRow = i + 1;
      if (key === 'last_run') lastRunRow = i + 1;
    }
    configSheet.getRange('B' + statusRow).setValue(message);
    configSheet.getRange('B' + lastRunRow).setValue(new Date());
    SpreadsheetApp.flush();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRUY VẤN MỐC THỜI GIAN LỚN NHẤT TỪ BIGQUERY (INCREMENTAL)
// ─────────────────────────────────────────────────────────────────────────────

function getMaxDateFromBQ(cfg, job) {
  if (!job.dateField) {
    // Nếu báo cáo không lọc incremental theo ngày, dùng mốc v_from_date của tham số gốc làm mặc định
    return job.parameters.v_from_date || '2025-10-27T17:00:00.000Z';
  }
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

  // Clone parameters
  var reportParams = JSON.parse(JSON.stringify(job.parameters));

  // Chỉ ghi đè ngày nếu báo cáo có dateField (không phải snapshot)
  // Snapshot job giữ nguyên v_from_date và v_to_date trong config
  if (job.dateField) {
    var toDate = new Date().toISOString();
    reportParams["v_from_date"] = fromDate;
    reportParams["v_to_date"] = toDate;
  }

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
// 5A. SNAPSHOT JOBS: XÓA SẠCH VÀ NẠP LẠI TOÀN BỘ (WRITE_TRUNCATE)
// ─────────────────────────────────────────────────────────────────────────────

function replaceIntoBigQuery(cfg, records, job) {
  if (!records || records.length === 0) return 0;

  var targetTableId = job.name;
  var targetTable = BigQuery.Tables.get(cfg.projectId, cfg.datasetId, targetTableId);
  var targetSchema = targetTable.schema;

  var newlineJsonString = records.map(function (row) {
    var cleanRow = {};
    targetSchema.fields.forEach(function (field) {
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
          tableId: targetTableId
        },
        schema: targetSchema,
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_TRUNCATE'  // Xóa sạch và ghi lại toàn bộ
      }
    }
  };

  Logger.log(`[${job.name}] Snapshot: WRITE_TRUNCATE vào bảng ${targetTableId} (${records.length} dòng)`);
  var loadJob = BigQuery.Jobs.insert(jobConfig, cfg.projectId, dataBlob);

  var jobId = loadJob.jobReference.jobId;
  while (true) {
    var status = BigQuery.Jobs.get(cfg.projectId, jobId).status;
    if (status.state === 'DONE') {
      if (status.errorResult) {
        throw new Error('Lỗi load Snapshot: ' + status.errorResult.message);
      }
      break;
    }
    Utilities.sleep(1000);
  }

  return records.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5B. INCREMENTAL JOBS: MERGE VÀO GOOGLE BIGQUERY (DÙNG STAGING TABLE VÀ DML)
// ─────────────────────────────────────────────────────────────────────────────

function mergeIntoBigQuery(cfg, records, job) {
  if (!records || records.length === 0) return 0;

  var targetTableId = job.name;
  var stagingTableId = targetTableId + '_staging_tmp';

  var targetTable = BigQuery.Tables.get(cfg.projectId, cfg.datasetId, targetTableId);
  var targetSchema = targetTable.schema;
  var fields = targetSchema.fields.map(function (f) { return f.name; });

  var newlineJsonString = records.map(function (row) {
    var cleanRow = {};
    targetSchema.fields.forEach(function (field) {
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

  var onClause = job.uniqueKeys.map(function (k) { return `T.\`${k}\` = S.\`${k}\``; }).join(' AND ');
  var updateSet = fields.map(function (f) { return `T.\`${f}\` = S.\`${f}\``; }).join(', ');
  var insFields = fields.map(function (f) { return `\`${f}\``; }).join(', ');
  var insValues = fields.map(function (f) { return `S.\`${f}\``; }).join(', ');

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

      // Step 3: Ghi dữ liệu vào BigQuery
      // - Snapshot job (isSnapshot: true): WRITE_TRUNCATE → xóa sạch & nạp lại
      // - Incremental job: MERGE (UPSERT) theo uniqueKeys
      var upsertedCount;
      if (job.isSnapshot) {
        upsertedCount = replaceIntoBigQuery(cfg, records, job);
        writeLog(job.name, 'SUCCESS', upsertedCount, 'Snapshot: Thay thế toàn bộ thành công.');
      } else {
        upsertedCount = mergeIntoBigQuery(cfg, records, job);
        writeLog(job.name, 'SUCCESS', upsertedCount, 'Incremental: Đồng bộ thành công.');
      }
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. WEB API - NHẬN TOKEN TỰ ĐỘNG TỪ BÊN NGOÀI
// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  var responseOutput;
  try {
    // 1. Phân tích dữ liệu JSON nhận được
    var postData = JSON.parse(e.postData.contents);
    var token = postData.token;

    // 2. Kiểm tra token có hợp lệ không (phải có chuỗi JWT ey...)
    if (!token || !token.startsWith("ey")) {
      responseOutput = {
        success: false,
        message: "Token không hợp lệ hoặc rỗng."
      };
    } else {
      // 3. Ghi đè token vào ô B1 của tab Config
      var configSheet = SPREADSHEET.getSheetByName('Config');
      if (!configSheet) {
        // Tự khởi tạo nếu chưa có
        setupSheet();
        configSheet = SPREADSHEET.getSheetByName('Config');
      }

      configSheet.getRange('B1').setValue(token.trim());

      // Ghi log việc cập nhật token thành công
      writeLog('System_Token', 'SUCCESS', 0, 'Đã tự động cập nhật token mới từ trình duyệt. Pipeline sẽ chạy trong vòng 1 phút...');

      // 4. Kích hoạt pipeline ASYNC (tránh timeout 30s của Web App)
      //    Tạo one-time trigger để runPipeline() chạy sau ~1 phút
      triggerPipelineAsync();

      responseOutput = {
        success: true,
        message: "Cập nhật token thành công. Pipeline sẽ tự động đồng bộ BigQuery trong vòng 1 phút."
      };
    }
  } catch (error) {
    responseOutput = {
      success: false,
      message: "Lỗi xử lý: " + error.message
    };
  }

  // Trả về kết quả dưới dạng JSON cho client (Tampermonkey)
  return ContentService.createTextOutput(JSON.stringify(responseOutput))
    .setMimeType(ContentService.MimeType.JSON);
}
