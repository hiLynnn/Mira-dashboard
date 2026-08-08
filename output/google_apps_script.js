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
    name: "order_detail",
    reportId: "OrderItemRevenueReportDetail",
    dateField: "order_date",
    uniqueKeys: ["order_detail_id"],
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
      "v_summary_by_order": false,
      "v_tax_mode": 3,
      "v_is_refresh": false,
      "v_session_key": "31dadf56c4ec76c3a95836bc4865fe9975556aa7a1654437be2ef67f42c3577c"
    },
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
    reportList: {
      "report_id": "OrderItemRevenueReportDetail",
      "report_name": "SO CHI TIET BAN HANG",
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
    dateField: "",
    isSnapshot: true,
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
      "v_lst_warehouse_name": "Tat ca",
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
      "report_name": "TONG HOP TON KHO",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_InventorySummaryReport",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_stock_ids, v_lst_warehouse_name, v_view_detail_by_stock, v_show_inventory_by_stock, v_branch_ids",
      "parameter_form_name": "inventory-summary-report/InventorySummaryReportParam",
      "parameter_viewer": "/inventory-summary-report/InventorySummaryReportViewer",
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
    // Báo cáo số 3: Chi tiết nhập xuất tồn kho theo hàng hóa
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
      "v_lst_warehouse_name": "Tat ca",
      "v_inventory_category_ids": null,
      "v_lst_category_name": "Tat ca",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tat ca",
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
      "report_name": "CHI TIET NHAP XUAT TON KHO THEO HANG HOA",
      "group_id": 6,
      "report_type": 1,
      "is_show": true,
      "function_report_name": "Proc_DetailedInventoryInboundReport",
      "function_param_order": "v_session_id, v_period, v_from_date, v_to_date, v_stock_ids, v_lst_warehouse_name, v_inventory_category_ids, v_lst_category_name, v_inventory_ids, v_show_inventory_by_stock, v_branch_ids",
      "parameter_form_name": "detailed-inventory-inbound-report/DetailedInventoryInboundReportParam",
      "parameter_viewer": "/detailed-inventory-inbound-report/DetailedInventoryInboundReportViewer",
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
      "v_lst_category_name": "Tat ca",
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
      "v_lst_vendor_name": "Tat ca",
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
      "v_lst_warehouse_name": "Tat ca",
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
    isSnapshot: true,
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
      "v_lst_warehouse_name": "Tat ca",
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
      "channel_names": "Tat ca",
      "cashier_names": "Tat ca",
      "employee_names": "Tat ca",
      "customer_names": "Tat ca",
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
    isSnapshot: true,
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
      "v_shop_names": "Tat ca",
      "v_lst_category_name": "Tat ca",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tat ca",
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
    isSnapshot: true,
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
      "v_account_object_name": "Tat ca",
      "v_lst_warehouse_name": "Tat ca",
      "v_inventory_category_ids": null,
      "v_lst_category_name": "Tat ca",
      "v_inventory_ids": null,
      "v_lst_inventory_name": "Tat ca",
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
// 1. TU DONG KHOI TAO CAU TRUC SHEETS (Chay 1 lan duy nhat)
// ─────────────────────────────────────────────────────────────────────────────

function setupSheet() {
  var configSheet = SPREADSHEET.getSheetByName('Config') || SPREADSHEET.insertSheet('Config');
  configSheet.clear();
  configSheet.getRange('A1:B5').setValues([
    ['bearer_token', ''],
    ['project_id',   'mira-503910'],
    ['dataset_id',   'mira_data'],
    ['status',       'Chua chay'],
    ['last_run',     '']
  ]);
  configSheet.getRange('A1:A5').setFontWeight('bold').setBackground('#f3f3f3');
  configSheet.getRange('A1:B5').setBorder(true, true, true, true, true, true);
  configSheet.setColumnWidth(1, 150);
  configSheet.setColumnWidth(2, 500);

  var logSheet = SPREADSHEET.getSheetByName('Log') || SPREADSHEET.insertSheet('Log');
  logSheet.clear();
  logSheet.appendRow(['Thoi gian', 'Bao cao', 'Trang thai', 'So ban ghi', 'Chi tiet']);
  logSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#d9ead3');
  logSheet.setColumnWidth(1, 180);
  logSheet.setColumnWidth(2, 150);
  logSheet.setColumnWidth(3, 100);
  logSheet.setColumnWidth(4, 120);
  logSheet.setColumnWidth(5, 300);

  var defaultSheet = SPREADSHEET.getSheetByName('Sheet1') || SPREADSHEET.getSheetByName('Trang tinh1');
  if (defaultSheet && SPREADSHEET.getSheets().length > 1) {
    try { SPREADSHEET.deleteSheet(defaultSheet); } catch (e) {}
  }

  try {
    SpreadsheetApp.getUi().alert('MIRA: Khoi tao thanh cong! Hay dien token vao tab Config roi chay pipeline.');
  } catch (e) {
    Logger.log('Khoi tao cau truc Sheets thanh cong!');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CAU HINH & TIEN ICH HE THONG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Doc cau hinh tu tab Config (1 lan duy nhat).
 * Cau truc co dinh: A1=bearer_token, A2=project_id, A3=dataset_id, A4=status, A5=last_run
 */
function getConfig() {
  var sheet = SPREADSHEET.getSheetByName('Config');
  if (!sheet) throw new Error('Khong tim thay tab "Config" trong Google Sheets.');
  var vals = sheet.getRange('B1:B3').getValues();
  return {
    token:     vals[0][0].toString().trim(),
    projectId: vals[1][0].toString().trim(),
    datasetId: vals[2][0].toString().trim()
  };
}

/**
 * [OPT] Log buffer: thu log vao bo dem, ghi 1 lan duy nhat cuoi pipeline.
 * Giam so lan goi Sheets API tu N xuong 1.
 */
var _logBuffer = [];

function writeLog(jobName, status, records, message) {
  _logBuffer.push([new Date(), jobName, status, records, message]);
}

function flushLog() {
  if (_logBuffer.length === 0) return;
  try {
    var sheet = SPREADSHEET.getSheetByName('Log');
    if (!sheet) {
      sheet = SPREADSHEET.insertSheet('Log');
      sheet.appendRow(['Thoi gian', 'Bao cao', 'Trang thai', 'So ban ghi', 'Chi tiet']);
    }
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, _logBuffer.length, 5).setValues(_logBuffer);
    _logBuffer = [];
  } catch (e) {
    Logger.log('Loi flushLog: ' + e.message);
  }
}

/**
 * Cap nhat trang thai tong quat tren tab Config.
 */
function updateGlobalStatus(message) {
  try {
    var configSheet = SPREADSHEET.getSheetByName('Config');
    if (!configSheet) return;
    configSheet.getRange('B4').setValue(message);
    configSheet.getRange('B5').setValue(new Date());
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('Loi updateGlobalStatus: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRUY VAN MOC THOI GIAN LON NHAT TU BIGQUERY (INCREMENTAL)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chuyen doi gia tri ngay tra ve tu BigQuery REST API sang chuan ISO 8601.
 * BigQuery co the tra ve:
 *   - Epoch seconds      (~1e9)
 *   - Epoch microseconds (~1e15)
 *   - Chuoi ngay gio     ("2026-08-04 00:00:00")
 */
function parseBQDateToISO(rawVal) {
  if (rawVal === undefined || rawVal === null) return null;
  var strVal = rawVal.toString().trim();
  if (!strVal) return null;

  var numVal = Number(strVal);
  if (!isNaN(numVal) && numVal > 0) {
    var ms = null;
    if (numVal > 1e13) {
      ms = numVal / 1000;
    } else if (numVal > 1e9) {
      ms = numVal * 1000;
    }
    if (ms !== null) {
      var dEpoch = new Date(ms);
      if (!isNaN(dEpoch.getTime()) && dEpoch.getFullYear() > 2000) return dEpoch.toISOString();
    }
  }

  var cleanDate = strVal.split('.')[0].replace(' ', 'T');
  if (cleanDate.length === 10) cleanDate += 'T00:00:00';
  if (!cleanDate.endsWith('Z')) cleanDate += '.000Z';
  var dStr = new Date(cleanDate);
  if (!isNaN(dStr.getTime()) && dStr.getFullYear() > 2000) return dStr.toISOString();

  return null;
}

/** Moc bat dau mac dinh khi bang BQ chua co du lieu. */
var DEFAULT_FROM_DATE = '2025-10-27T17:00:00.000Z';

/**
 * Lay gia tri MAX cua dateField tu BigQuery de lam moc cuon chieu (incremental).
 */
function getMaxDateFromBQ(cfg, job) {
  if (!job.dateField) return DEFAULT_FROM_DATE;

  var sql = 'SELECT MAX(`' + job.dateField + '`) as max_date ' +
            'FROM `' + cfg.projectId + '.' + cfg.datasetId + '.' + job.name + '` ' +
            'WHERE `' + job.dateField + '` IS NOT NULL';
  try {
    var result = BigQuery.Jobs.query({ query: sql, useLegacySql: false }, cfg.projectId);
    if (result.rows && result.rows[0] && result.rows[0].f[0].v != null) {
      var iso = parseBQDateToISO(result.rows[0].f[0].v);
      if (iso) {
        Logger.log('[' + job.name + '] max_date tu BQ: ' + iso);
        return iso;
      }
    }
  } catch (e) {
    Logger.log('[' + job.name + '] Bang chua co du lieu hoac loi BQ: ' + e.message);
  }
  return DEFAULT_FROM_DATE;
}

/**
 * Tinh khoang thoi gian dong cho snapshot jobs.
 * Vietnam timezone: UTC+7
 *   - period:8: chi can v_to_date = hom nay
 *   - period:4: from = dau thang hien tai (17:00 UTC hom truoc), to = hom nay
 */
function getSnapshotDateRange(job) {
  var now   = new Date();
  var toDyn = now.toISOString();

  var period = job.parameters && job.parameters['period'];
  if (period === 8) {
    return { from: null, to: toDyn };
  }

  var fromDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    1,
    17, 0, 0, 0
  ));
  if (fromDate > now) {
    fromDate.setUTCMonth(fromDate.getUTCMonth() - 1);
  }
  return { from: fromDate.toISOString(), to: toDyn };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXTRACT - FETCH DATA TU MISA API
// ─────────────────────────────────────────────────────────────────────────────

/** Trich xuat claim sid tu JWT de gan vao cookie session. */
function getSidFromToken(token) {
  if (!token || token.indexOf('.') === -1) return '';
  try {
    var parts = token.split('.');
    if (parts.length < 2) return '';
    var b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    var payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(b64)).getDataAsString());
    return payload.sid || '';
  } catch (e) {
    return '';
  }
}

/**
 * Xay dung headers MISA day du — dung chung cho ca fetchMisaData va runFullResync.
 */
function buildMisaHeaders(cleanToken, job) {
  var sid = getSidFromToken(cleanToken);
  var cookieHeader = sid
    ? ('_eshop_env=g1; env=g1; _eshop_x-session=' + sid + '; x-session=' + sid)
    : '_eshop_env=g1; env=g1';
  return {
    'accept':          'application/json, text/plain, */*',
    'accept-language': 'en,vi;q=0.9',
    'authorization':   'Bearer ' + cleanToken,
    'content-type':    'application/json',
    'cookie':          cookieHeader,
    'origin':          'https://eshopapp.misa.vn',
    'referer':         'https://eshopapp.misa.vn/management/rp/RPDynamicViewer/' + job.reportId,
    'x-deviceid':      '0099e0c7-f5b4-4998-9c37-5d5059c740cf',
    'x-ems-context':   '{"dbid":"7c06c972-5014-46e6-a8f8-d5c11767dca4","tid":"65589cba-5286-4dc8-a727-a7f5d8fe36c4","tco":"ctttmvdvmg92","lang":"vi","brid":"a38f9189-ad87-11ef-a35e-005056b28600","shtype":3,"ica":false}',
    'x-ms-bid':        'a38f9189-ad87-11ef-a35e-005056b28600',
    'user-agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
}

/**
 * Keo toan bo du lieu tu MISA eShop API cho mot job.
 * - Tu dong chia nho khoang thoi gian thanh cac khung 30 ngay.
 * - Gioi han 60 ngay lich su de tranh Apps Script 6 phut timeout.
 * - Moi khung thoi gian dung mot sessionId rieng (MISA yeu cau co dinh trong pagination).
 * - [OPT] Dung push() thay concat() de tranh tao mang moi O(n^2).
 */
function fetchMisaData(token, fromDate, job) {
  var apiUrl     = 'https://eshopapp.misa.vn/g1/api/report/dynamic/paging-filter';
  var cleanToken = (token || '').trim();
  if (cleanToken.toLowerCase().indexOf('bearer ') === 0) {
    cleanToken = cleanToken.substring(7).trim();
  }

  var headers    = buildMisaHeaders(cleanToken, job);
  var columnsStr = JSON.stringify(job.columns);
  var dateRanges = [];

  if (job.dateField) {
    // Loai A: Incremental
    var startMs   = new Date(fromDate || DEFAULT_FROM_DATE).getTime();
    var endMs     = Date.now();
    var maxHistMs = 60 * 24 * 60 * 60 * 1000;

    if (isNaN(startMs) || startMs > endMs) startMs = endMs - maxHistMs;
    if (endMs - startMs > maxHistMs) {
      startMs = endMs - maxHistMs;
      Logger.log('[' + job.name + '] Lich su >60 ngay, chi keo tu ' + new Date(startMs).toISOString());
    }

    var stepMs = 30 * 24 * 60 * 60 * 1000;
    for (var cur = startMs; cur < endMs;) {
      var next = Math.min(cur + stepMs, endMs);
      dateRanges.push({ from: new Date(cur).toISOString(), to: new Date(next).toISOString() });
      cur = next;
    }
  } else {
    // Loai B & C: Snapshot
    var snapshotRange = getSnapshotDateRange(job);
    dateRanges.push(snapshotRange);
    Logger.log('[' + job.name + '] Snapshot: from=' + (snapshotRange.from || 'giu_nguyen') + ' to=' + snapshotRange.to);
  }

  var allRecords = [];

  for (var r = 0; r < dateRanges.length; r++) {
    var range        = dateRanges[r];
    var reportParams = Object.assign({}, job.parameters);
    if (range.from) reportParams['v_from_date'] = range.from;
    if (range.to)   reportParams['v_to_date']   = range.to;

    var currentSessionId          = Utilities.getUuid();
    reportParams['v_session_key'] = Utilities.getUuid().replace(/-/g, '');
    var encodedParams             = Utilities.base64Encode(JSON.stringify(reportParams), Utilities.Charset.UTF_8);

    var skip = 0, take = 500, totalRecords = null;

    while (true) {
      var payload = {
        'report_id':        job.reportId,
        'report_load_type': 1,
        'parameters':       encodedParams,
        'columns':          columnsStr,
        'report_list':      job.reportList,
        'is_export':        false,
        'session_id':       currentSessionId,
        'skip':             skip,
        'take':             take
      };

      var options = {
        'method':             'post',
        'headers':            headers,
        'payload':            JSON.stringify(payload),
        'muteHttpExceptions': true
      };

      var response     = UrlFetchApp.fetch(apiUrl, options);
      var responseCode = response.getResponseCode();
      var responseText = response.getContentText();

      // Retry 1 lan neu server 500
      if (responseCode === 500) {
        Logger.log('[' + job.name + '] MISA 500, thu lai sau 3s...');
        Utilities.sleep(3000);
        response     = UrlFetchApp.fetch(apiUrl, options);
        responseCode = response.getResponseCode();
        responseText = response.getContentText();
      }

      if (responseCode === 401 || responseCode === 422) {
        throw new Error('TOKEN_EXPIRED: Token het han (HTTP ' + responseCode + ').');
      }
      if (responseCode !== 200) {
        throw new Error('MISA API Error (' + responseCode + '): ' + responseText.substring(0, 300));
      }

      var resJson = JSON.parse(responseText);
      var rows    = extractRows(resJson, job.reportId);

      if (totalRecords === null) totalRecords = extractTotal(resJson);
      if (!rows || rows.length === 0) break;

      // [OPT] push tung phan tu thay vi concat — tranh tao mang trung gian O(n^2)
      for (var ri = 0; ri < rows.length; ri++) allRecords.push(rows[ri]);

      var progressStr = totalRecords ? ' / ' + totalRecords : '';
      Logger.log('[' + job.name + '] Da tai: ' + allRecords.length + progressStr + ' (skip=' + skip + ')');

      if (rows.length < take) break;
      if (totalRecords !== null && allRecords.length >= totalRecords) break;
      if (skip >= 100000) break;

      skip += take;
      Utilities.sleep(300);
    }
  }

  return allRecords;
}

/** Trich tong so ban ghi tu response JSON cua MISA. */
function extractTotal(resData) {
  if (!resData || typeof resData !== 'object') return null;
  var keys = ['total', 'Total', 'total_count', 'TotalCount', 'count', 'Count'];
  for (var i = 0; i < keys.length; i++) {
    if (typeof resData[keys[i]] === 'number') return resData[keys[i]];
  }
  if (resData.data && typeof resData.data === 'object') {
    for (var j = 0; j < keys.length; j++) {
      if (typeof resData.data[keys[j]] === 'number') return resData.data[keys[j]];
    }
  }
  return null;
}

/**
 * Trich mang du lieu tu response JSON cua MISA.
 * [OPT] Cache key phan hoi theo reportId — cac page sau khong phai loop lai.
 */
var _rowsKeyCache = {};

function extractRows(resData, reportId) {
  if (Array.isArray(resData)) return resData;
  if (!resData || typeof resData !== 'object') return [];

  // Su dung cached key neu co
  if (reportId && _rowsKeyCache[reportId]) {
    var cacheKey = _rowsKeyCache[reportId];
    if (cacheKey.indexOf('.') === -1) {
      var cached = resData[cacheKey];
      if (Array.isArray(cached)) return cached;
    } else {
      var parts = cacheKey.split('.');
      var obj = resData[parts[0]];
      if (obj && Array.isArray(obj[parts[1]])) return obj[parts[1]];
    }
  }

  var keys = ['data', 'Data', 'rows', 'Rows', 'results', 'Results', 'items', 'Items'];
  for (var i = 0; i < keys.length; i++) {
    var val = resData[keys[i]];
    if (Array.isArray(val) && val.length > 0) {
      if (reportId) _rowsKeyCache[reportId] = keys[i];
      return val;
    }
    if (val && typeof val === 'object') {
      for (var si = 0; si < keys.length; si++) {
        var sub = val[keys[si]];
        if (Array.isArray(sub) && sub.length > 0) {
          if (reportId) _rowsKeyCache[reportId] = keys[i] + '.' + keys[si];
          return sub;
        }
      }
    }
  }
  // Fallback: tim bat ky mang object nao trong response
  for (var k in resData) {
    if (Array.isArray(resData[k]) && resData[k].length > 0 && typeof resData[k][0] === 'object') {
      if (reportId) _rowsKeyCache[reportId] = k;
      return resData[k];
    }
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HELPER DUNG CHUNG CHO BIGQUERY (DRY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [OPT] Cache schema BigQuery trong mot pipeline run — tranh goi Tables.get nhieu lan.
 */
var _schemaCache = {};

function getSchema(cfg, tableName) {
  if (!_schemaCache[tableName]) {
    _schemaCache[tableName] = BigQuery.Tables.get(cfg.projectId, cfg.datasetId, tableName).schema;
  }
  return _schemaCache[tableName];
}

/**
 * Serialize mang records thanh NDJSON blob phu hop voi BigQuery Load API.
 * [OPT] Dung vong for thay vi map/join de tranh tao mang trung gian lon.
 */
function buildNdjsonBlob(records, schema) {
  var lines = [];
  for (var i = 0; i < records.length; i++) {
    var row = records[i], cleanRow = {};
    for (var fi = 0; fi < schema.fields.length; fi++) {
      var field = schema.fields[fi];
      var val   = row[field.name];
      if (val === undefined || val === null || val === '') {
        cleanRow[field.name] = null;
      } else if (field.type === 'FLOAT' || field.type === 'INTEGER') {
        cleanRow[field.name] = Number(val);
      } else if (field.type === 'BOOLEAN') {
        cleanRow[field.name] = (val === true || val === 'true' || val === 1);
      } else {
        cleanRow[field.name] = val.toString();
      }
    }
    lines.push(JSON.stringify(cleanRow));
  }
  return Utilities.newBlob(lines.join('\n'), 'application/octet-stream');
}

/**
 * Cho mot BigQuery job hoan thanh.
 * [OPT] Exponential backoff: 1s -> 2s -> 4s -> 5s (cap 5s).
 *       Job nhanh (<3s) khong bi poll thu qua, job dai khong poll qua thuong.
 */
function waitForBQJob(projectId, jobId, maxWaitSec) {
  var maxWait = maxWaitSec || 300;
  var elapsed = 0, pollCount = 0;

  while (elapsed < maxWait) {
    var jobStatus = BigQuery.Jobs.get(projectId, jobId).status;
    if (jobStatus.state === 'DONE') {
      if (jobStatus.errorResult) {
        throw new Error('BQ Job that bai: ' + jobStatus.errorResult.message);
      }
      return;
    }
    var waitSec = Math.min(Math.pow(2, Math.floor(pollCount / 2)), 5);
    Utilities.sleep(waitSec * 1000);
    elapsed += waitSec;
    pollCount++;
  }
  throw new Error('BQ Job timeout sau ' + maxWait + 's (jobId=' + jobId + ')');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6A. SNAPSHOT JOBS: XOA SACH VA NAP LAI TOAN BO (WRITE_TRUNCATE)
// ─────────────────────────────────────────────────────────────────────────────

function replaceIntoBigQuery(cfg, records, job) {
  if (!records || records.length === 0) return 0;

  var schema   = getSchema(cfg, job.name);
  var dataBlob = buildNdjsonBlob(records, schema);

  var loadJob = BigQuery.Jobs.insert({
    configuration: {
      load: {
        destinationTable: { projectId: cfg.projectId, datasetId: cfg.datasetId, tableId: job.name },
        schema:           schema,
        sourceFormat:     'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_TRUNCATE'
      }
    }
  }, cfg.projectId, dataBlob);

  Logger.log('[' + job.name + '] WRITE_TRUNCATE ' + records.length + ' dong...');
  waitForBQJob(cfg.projectId, loadJob.jobReference.jobId);
  return records.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6B. INCREMENTAL JOBS: MERGE VAO GOOGLE BIGQUERY (STAGING + DML MERGE)
// ─────────────────────────────────────────────────────────────────────────────

function mergeIntoBigQuery(cfg, records, job) {
  if (!records || records.length === 0) return 0;

  if (!job.uniqueKeys || job.uniqueKeys.length === 0) {
    throw new Error('[' + job.name + '] Thieu uniqueKeys - khong the thuc hien MERGE.');
  }

  // Loai bo trung lap theo uniqueKeys trong batch moi truoc khi load staging
  var recordMap = {};
  for (var ri = 0; ri < records.length; ri++) {
    var r        = records[ri];
    var keyParts = job.uniqueKeys.map(function (k) {
      return (r[k] !== undefined && r[k] !== null && r[k] !== '') ? String(r[k]) : '';
    });
    var allValid = keyParts.every(function (p) { return p !== ''; });
    var keyStr   = allValid ? keyParts.join('_') : JSON.stringify(r);
    recordMap[keyStr] = r;
  }
  var cleanRecords = Object.keys(recordMap).map(function (k) { return recordMap[k]; });
  if (cleanRecords.length < records.length) {
    Logger.log('[' + job.name + '] Loc trung batch: ' + records.length + ' -> ' + cleanRecords.length);
  }

  var schema    = getSchema(cfg, job.name);
  var fields    = schema.fields.map(function (f) { return f.name; });
  var stagingId = job.name + '_staging_tmp';
  var dataBlob  = buildNdjsonBlob(cleanRecords, schema);

  // Buoc 1: Load vao staging table
  var loadJob = BigQuery.Jobs.insert({
    configuration: {
      load: {
        destinationTable: { projectId: cfg.projectId, datasetId: cfg.datasetId, tableId: stagingId },
        schema:           schema,
        sourceFormat:     'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_TRUNCATE'
      }
    }
  }, cfg.projectId, dataBlob);

  Logger.log('[' + job.name + '] Load staging: ' + stagingId);
  waitForBQJob(cfg.projectId, loadJob.jobReference.jobId);

  // Buoc 2: MERGE staging -> target table
  var fqTarget  = '`' + cfg.projectId + '.' + cfg.datasetId + '.' + job.name + '`';
  var fqStaging = '`' + cfg.projectId + '.' + cfg.datasetId + '.' + stagingId + '`';
  var onClause  = job.uniqueKeys.map(function (k) { return 'T.`' + k + '` = S.`' + k + '`'; }).join(' AND ');
  var updateSet = fields.map(function (f) { return 'T.`' + f + '` = S.`' + f + '`'; }).join(', ');
  var insFields = fields.map(function (f) { return '`' + f + '`'; }).join(', ');
  var insValues = fields.map(function (f) { return 'S.`' + f + '`'; }).join(', ');

  var mergeSql = [
    'MERGE ' + fqTarget + ' T',
    'USING ' + fqStaging + ' S',
    'ON ' + onClause,
    'WHEN MATCHED THEN UPDATE SET ' + updateSet,
    'WHEN NOT MATCHED THEN INSERT (' + insFields + ') VALUES (' + insValues + ')'
  ].join('\n');

  var mergeJob = BigQuery.Jobs.insert({
    configuration: { query: { query: mergeSql, useLegacySql: false } }
  }, cfg.projectId);

  Logger.log('[' + job.name + '] MERGE into ' + job.name + '...');
  waitForBQJob(cfg.projectId, mergeJob.jobReference.jobId);

  // Don staging table
  try {
    BigQuery.Tables.remove(cfg.projectId, cfg.datasetId, stagingId);
    Logger.log('[' + job.name + '] Xoa staging OK.');
  } catch (e) {
    Logger.log('[' + job.name + '] Loi xoa staging: ' + e.message);
  }

  return cleanRecords.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. HAM TIEN ICH: FULL RE-SYNC (Chay thu cong khi can dong bo lai tu dau)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Re-sync toan bo lich su cua MOT job cu the — KHONG bi gioi han 60 ngay.
 *
 * THIET KE: Moi lan chay xu ly DUNG 1 chunk 30 ngay, luu checkpoint vao
 * PropertiesService. Bam Run nhieu lan cho den khi in "RESYNC DONE".
 *
 * CACH DUNG:
 *   1. Sua RESYNC_JOB_NAME  = ten job can dong bo (vi du: 'order_detail')
 *   2. Sua RESYNC_FROM_DATE = ngay bat dau (chi set lan dau, lan sau tu dong resume)
 *   3. Chon ham runFullResync trong dropdown va nhan Run
 *   4. Xem Execution log: khi in "RESYNC DONE" la xong
 *
 * De bat dau lai tu dau: chay resetResync() truoc.
 *
 * [OPT] Da refactor de dung lai fetchMisaData — headers day du (cookie,
 *        x-ems-context, v.v.) va retry logic duoc ap dung tu dong.
 */
function runFullResync() {
  var RESYNC_JOB_NAME  = 'order_detail';   // <-- Sua ten job o day
  var RESYNC_FROM_DATE = DEFAULT_FROM_DATE; // <-- Ngay bat dau

  // Tim job config
  var job = null;
  for (var i = 0; i < JOBS.length; i++) {
    if (JOBS[i].name === RESYNC_JOB_NAME) { job = JOBS[i]; break; }
  }
  if (!job) { Logger.log('Khong tim thay job: ' + RESYNC_JOB_NAME); return; }

  var cfg = getConfig();
  if (!cfg.token) { Logger.log('Token trong - dung lai.'); return; }

  // Doc checkpoint
  var props         = PropertiesService.getScriptProperties();
  var checkpointKey = 'resync_checkpoint_' + RESYNC_JOB_NAME;
  var chunkFrom     = props.getProperty(checkpointKey) || RESYNC_FROM_DATE;
  var endMs         = Date.now();
  var startMs       = new Date(chunkFrom).getTime();

  if (startMs >= endMs) {
    Logger.log('[' + RESYNC_JOB_NAME + '] RESYNC DONE! Tat ca chunk da duoc xu ly.');
    writeLog(RESYNC_JOB_NAME, 'RESYNC_DONE', 0, 'Toan bo lich su da dong bo xong.');
    flushLog();
    props.deleteProperty(checkpointKey);
    return;
  }

  // Tinh chunk hien tai (30 ngay)
  var stepMs    = 30 * 24 * 60 * 60 * 1000;
  var chunkTo   = new Date(Math.min(startMs + stepMs, endMs)).toISOString();
  var remaining = Math.ceil((endMs - startMs) / stepMs);

  Logger.log('[' + RESYNC_JOB_NAME + '] Chunk: ' + chunkFrom + ' -> ' + chunkTo + ' (con lai ~' + remaining + ')');
  writeLog(RESYNC_JOB_NAME, 'RESYNC', 0,
    'Chunk: ' + chunkFrom.substring(0, 10) + ' -> ' + chunkTo.substring(0, 10) + ' (con ~' + remaining + ' chunk)');

  // Fetch truc tiep 1 chunk (chunkFrom -> chunkTo) — KHONG dung fetchMisaData
  // vi fetchMisaData luon lay endMs = Date.now(), pha vo co che checkpoint 30-ngay-mot-lan.
  var cleanTokenR  = (cfg.token || '').trim();
  if (cleanTokenR.toLowerCase().indexOf('bearer ') === 0) {
    cleanTokenR = cleanTokenR.substring(7).trim();
  }
  var resyncHeaders = buildMisaHeaders(cleanTokenR, job);
  var resyncParams  = Object.assign({}, job.parameters, {
    'v_from_date': chunkFrom,
    'v_to_date':   chunkTo
  });
  resyncParams['v_session_key'] = Utilities.getUuid().replace(/-/g, '');
  var encodedResync = Utilities.base64Encode(JSON.stringify(resyncParams), Utilities.Charset.UTF_8);
  var resyncSession = Utilities.getUuid();
  var resyncApiUrl  = 'https://eshopapp.misa.vn/g1/api/report/dynamic/paging-filter';
  var columnsStr    = JSON.stringify(job.columns);

  var chunkRecords = [];
  var rSkip = 0, rTake = 500, totalResync = null;
  while (true) {
    var rPayload = {
      'report_id':        job.reportId,
      'report_load_type': 1,
      'parameters':       encodedResync,
      'columns':          columnsStr,
      'report_list':      job.reportList,
      'is_export':        false,
      'session_id':       resyncSession,
      'skip':             rSkip,
      'take':             rTake
    };
    var rOpts = {
      'method':             'post',
      'headers':            resyncHeaders,
      'payload':            JSON.stringify(rPayload),
      'muteHttpExceptions': true
    };
    var rRes  = UrlFetchApp.fetch(resyncApiUrl, rOpts);
    var rCode = rRes.getResponseCode();
    if (rCode === 500) {
      Utilities.sleep(3000);
      rRes  = UrlFetchApp.fetch(resyncApiUrl, rOpts);
      rCode = rRes.getResponseCode();
    }
    if (rCode === 401 || rCode === 422) throw new Error('TOKEN_EXPIRED: HTTP ' + rCode);
    if (rCode !== 200) throw new Error('MISA API Error (' + rCode + '): ' + rRes.getContentText().substring(0, 200));

    var rJson = JSON.parse(rRes.getContentText());
    var rRows = extractRows(rJson, job.reportId);
    if (totalResync === null) totalResync = extractTotal(rJson);
    if (!rRows || rRows.length === 0) break;
    for (var ri2 = 0; ri2 < rRows.length; ri2++) chunkRecords.push(rRows[ri2]);
    Logger.log('[' + RESYNC_JOB_NAME + '] Da tai: ' + chunkRecords.length + (totalResync ? ' / ' + totalResync : '') + ' (skip=' + rSkip + ')');
    if (rRows.length < rTake) break;
    if (totalResync !== null && chunkRecords.length >= totalResync) break;
    if (rSkip >= 100000) break;
    rSkip += rTake;
    Utilities.sleep(300);
  }

  Logger.log('[' + RESYNC_JOB_NAME + '] Fetch xong: ' + chunkRecords.length + ' dong.');

  // MERGE vao BigQuery
  var merged = 0;
  if (chunkRecords.length > 0) {
    merged = mergeIntoBigQuery(cfg, chunkRecords, job);
    Logger.log('[' + RESYNC_JOB_NAME + '] MERGE xong: ' + merged + ' ban ghi.');
  } else {
    Logger.log('[' + RESYNC_JOB_NAME + '] Chunk trong, bo qua MERGE.');
  }

  // Luu checkpoint
  props.setProperty(checkpointKey, chunkTo);
  var nextRemaining = Math.ceil((endMs - new Date(chunkTo).getTime()) / stepMs);

  if (nextRemaining <= 0) {
    Logger.log('[' + RESYNC_JOB_NAME + '] RESYNC DONE! Tat ca chunk da xu ly xong.');
    writeLog(RESYNC_JOB_NAME, 'RESYNC_DONE', merged, 'Chunk cuoi hoan thanh. Toan bo lich su da dong bo.');
    props.deleteProperty(checkpointKey);
  } else {
    Logger.log('[' + RESYNC_JOB_NAME + '] Chunk nay xong. Con lai ~' + nextRemaining + ' chunk. Bam Run lai.');
    writeLog(RESYNC_JOB_NAME, 'RESYNC_CHUNK', merged,
      'Chunk ' + chunkFrom.substring(0, 10) + ' xong. Con ~' + nextRemaining + ' chunk. Bam Run lai.');
  }

  flushLog();
}

/**
 * Xoa checkpoint de bat dau lai resync tu dau.
 */
function resetResync() {
  var RESYNC_JOB_NAME = 'order_detail'; // <-- Sua ten job tuong ung
  PropertiesService.getScriptProperties().deleteProperty('resync_checkpoint_' + RESYNC_JOB_NAME);
  Logger.log('Da xoa checkpoint cho job: ' + RESYNC_JOB_NAME);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. HAM DIEU PHOI CHINH
// ─────────────────────────────────────────────────────────────────────────────

function runPipeline() {

  // Chong chay song song
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    writeLog('System_Pipeline', 'SKIPPED', 0, 'Pipeline dang chay o noi khac, bo qua instance nay.');
    flushLog();
    return;
  }

  // Reset cache va buffer giua cac lan chay
  _schemaCache  = {};
  _rowsKeyCache = {};
  _logBuffer    = [];

  // [OPT] Timeout guard: Apps Script gioi han 6 phut, dung truoc 5 phut (300s)
  var PIPELINE_TIMEOUT_MS = 300 * 1000;
  var pipelineStart       = Date.now();

  try {
    var cfg;
    try {
      cfg = getConfig();
    } catch (e) {
      writeLog('System_Pipeline', 'ERROR', 0, 'Loi doc config: ' + e.message);
      updateGlobalStatus('Loi doc config: ' + e.message);
      flushLog();
      return;
    }

    if (!cfg.token) {
      writeLog('System_Pipeline', 'ERROR', 0, 'Token rong - pipeline dung.');
      updateGlobalStatus('Thieu Token MISA');
      flushLog();
      return;
    }

    updateGlobalStatus('Dang chay pipeline (' + JOBS.length + ' jobs)...');
    writeLog('System_Pipeline', 'STARTED', 0,
      'Pipeline bat dau ' + JOBS.length + ' jobs luc ' + new Date().toLocaleString('vi-VN'));

    var totalJobs    = JOBS.length;
    var successCount = 0;
    var errorList    = [];

    for (var i = 0; i < totalJobs; i++) {
      var job = JOBS[i];

      // [OPT] Timeout guard: kiem tra truoc moi job
      var elapsed = Date.now() - pipelineStart;
      if (elapsed > PIPELINE_TIMEOUT_MS) {
        var timeoutMsg = 'Timeout guard: da chay ' + Math.round(elapsed / 1000) + 's. Dung truoc job ' + job.name + '.';
        Logger.log('[System_Pipeline] ' + timeoutMsg);
        writeLog('System_Pipeline', 'TIMEOUT_GUARD', i, timeoutMsg);
        for (var j = i; j < totalJobs; j++) {
          errorList.push(JOBS[j].name + ': BI BO QUA (timeout guard)');
        }
        break;
      }

      writeLog(job.name, 'RUNNING', 0, '[' + (i + 1) + '/' + totalJobs + '] Bat dau...');

      try {
        // Step 1: Lay moc thoi gian
        var fromDate = job.isSnapshot ? null : getMaxDateFromBQ(cfg, job);
        if (fromDate) writeLog(job.name, 'DEBUG', 0, 'Moc cuon chieu: ' + fromDate);

        // Step 2: Keo du lieu tu MISA
        var records = fetchMisaData(cfg.token, fromDate, job);
        writeLog(job.name, 'DEBUG', records.length, 'MISA tra ve ' + records.length + ' dong');

        // Retry cho Snapshot (session cache chua san sang)
        if (records.length === 0 && job.isSnapshot) {
          writeLog(job.name, 'DEBUG', 0, 'Cache chua san sang, thu lai sau 3s...');
          Utilities.sleep(3000);
          records = fetchMisaData(cfg.token, fromDate, job);
          writeLog(job.name, 'DEBUG', records.length, 'Retry: ' + records.length + ' dong');
        }

        if (records.length === 0) {
          var noDataMsg = job.isSnapshot
            ? 'MISA tra ve 0 dong cho bao cao Snapshot.'
            : 'Du lieu da moi nhat, khong co ban ghi moi.';
          writeLog(job.name, 'NO_DATA', 0, noDataMsg);
          successCount++;
          continue;
        }

        // Step 3: Ghi vao BigQuery
        var mode = job.isSnapshot ? 'SNAPSHOT' : 'MERGE';
        writeLog(job.name, 'DEBUG', records.length, 'Ghi vao BigQuery (' + mode + ')...');

        var upsertedCount;
        if (job.isSnapshot) {
          upsertedCount = replaceIntoBigQuery(cfg, records, job);
          writeLog(job.name, 'SUCCESS', upsertedCount, 'Snapshot: Thay the toan bo thanh cong.');
        } else {
          upsertedCount = mergeIntoBigQuery(cfg, records, job);
          writeLog(job.name, 'SUCCESS', upsertedCount, 'Incremental: Dong bo thanh cong.');
        }
        successCount++;

      } catch (err) {
        var errMsg = err.message || String(err);
        writeLog(job.name, 'ERROR', 0, errMsg);
        errorList.push(job.name + ': ' + errMsg);
      }
    }

    // Tong ket
    if (errorList.length === 0) {
      updateGlobalStatus('Thanh cong ' + successCount + '/' + totalJobs + ' bao cao');
      writeLog('System_Pipeline', 'DONE', successCount, 'Hoan thanh ' + totalJobs + ' jobs.');
    } else {
      var summary = 'Loi ' + (totalJobs - successCount) + '/' + totalJobs + ': ' + errorList.join(' | ');
      updateGlobalStatus(summary);
      writeLog('System_Pipeline', 'DONE', successCount, summary);
    }

  } finally {
    flushLog(); // Ghi log 1 lan duy nhat
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WEB API - NHAN TOKEN TU DONG TU BROWSER (Tampermonkey)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nhan POST request tu Tampermonkey: { "token": "eyJ..." }
 * Ghi token vao Config, chay pipeline va tra ve ket qua.
 */
function doPost(e) {
  var output;
  try {
    var postData = JSON.parse(e.postData.contents);
    var token    = postData.token;

    if (!token || !token.startsWith('ey')) {
      output = { success: false, message: 'Token khong hop le hoac rong.' };
    } else {
      var configSheet = SPREADSHEET.getSheetByName('Config');
      if (!configSheet) {
        setupSheet();
        configSheet = SPREADSHEET.getSheetByName('Config');
      }
      configSheet.getRange('B1').setValue(token.trim());

      writeLog('System_Token', 'SUCCESS', 0, 'Token moi duoc nhan, bat dau pipeline...');
      updateGlobalStatus('Token moi nhan, dang chay pipeline...');

      runPipeline();

      output = { success: true, message: 'Cap nhat token va dong bo BigQuery thanh cong.' };
    }
  } catch (err) {
    output = { success: false, message: 'Loi xu ly: ' + err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
