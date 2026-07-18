# Job Schema – Cấu trúc file cấu hình báo cáo MISA

Mỗi file trong `jobs/` là một JSON object với các trường sau:

## Cấu trúc đầy đủ

```json
{
  "name": "tên_job",              // REQUIRED – snake_case, khớp tên file
  "report_id": "ReportIdMISA",   // REQUIRED – lấy từ payload cURL
  "report_load_type": 1,          // REQUIRED – thường là 1, lấy từ cURL
  "output_csv": "tên_job.csv",   // REQUIRED – tên file CSV đầu ra
  "take": 500,                    // Số records/trang. Giữ 500 để tối ưu
  "date_field": "order_date",    // Cột ngày dùng cho incremental update
  "unique_keys": ["order_detail_id"], // Khóa chính để dedup
  "parameters": { ... },          // Tham số filter của báo cáo (decoded từ base64)
  "columns": [ ... ],             // Danh sách cột cần lấy
  "report_list": { ... }          // Metadata báo cáo từ MISA (copy từ cURL)
}
```

---

## Chi tiết từng trường

### `name`
- Phải trùng với tên file (không có `.json`).
- Dùng để lọc khi chạy: `run_all.py <name>`.

### `date_field`
- Tên field trong `columns` dùng làm mốc thời gian cho **incremental update**.
- Engine sẽ tìm giá trị `max(date_field)` trong CSV cũ và dùng làm `v_from_date` cho lần chạy tiếp theo.
- **Các giá trị phổ biến:** `order_date`, `ref_date`, `voucher_date`, `created_date`.
- ⚠️ Nếu chọn sai field, incremental sẽ không hoạt động đúng → lấy lại toàn bộ dữ liệu mỗi lần.

### `unique_keys`
- Danh sách các field dùng làm khóa phức để **loại bỏ trùng lặp** khi gộp dữ liệu mới với cũ.
- **Các giá trị phổ biến:** `["order_detail_id"]`, `["detail_id"]`, `["ref_id", "item_id"]`.
- ⚠️ Nếu không có khóa duy nhất rõ ràng, dùng tổ hợp nhiều field.

### `take`
- Số records mỗi page API. **Không thay đổi khỏi 500** trừ khi API báo lỗi timeout.
- Nếu báo cáo có nhiều cột phức tạp và timeout, thử giảm xuống 200 hoặc 100.

### `parameters`
Object chứa các tham số filter, được **decode từ base64** của payload cURL.  
Các trường quan trọng:
- `v_from_date`: Ngày bắt đầu (ISO 8601, UTC). Sẽ bị ghi đè bởi engine khi incremental.
- `v_to_date`: Ngày kết thúc. Sẽ bị ghi đè thành "hôm nay" nếu `auto_date_to_today: true` trong config.
- `v_is_whole_chain`: `false` = chỉ lấy dữ liệu của 1 chi nhánh.
- `v_branch_ids`: ID chi nhánh (lấy từ `x_ms_bid` trong config).
- `v_session_key`: Session key của MISA – không cần thay đổi thủ công.

### `columns`
Array các object định nghĩa cột. Mỗi object gồm:
```json
{
  "dataFormat": 5,          // 1=tiền, 4=số, 5=text, 6=ngày
  "field": "tên_cột",      // Tên field trong API response
  "hasSummary": true        // Có aggregate trong summary hay không
}
```

**Quy ước `dataFormat`:**
| Giá trị | Kiểu dữ liệu |
|---------|--------------|
| 1       | Số tiền (currency) |
| 4       | Số nguyên/thập phân |
| 5       | Text/string |
| 6       | DateTime |

---

## Ví dụ: Job tồn kho đơn giản

```json
{
  "name": "inventory",
  "report_id": "InventoryBalanceReport",
  "report_load_type": 1,
  "output_csv": "inventory.csv",
  "take": 500,
  "date_field": "ref_date",
  "unique_keys": ["item_id"],
  "parameters": {
    "period": 4,
    "v_is_whole_chain": false,
    "v_branch_ids": "a38f9189-ad87-11ef-a35e-005056b28600",
    "v_from_date": "2025-10-27T17:00:00.000Z",
    "v_to_date": "2026-07-14T17:00:00.000Z"
  },
  "columns": [
    {"dataFormat": 6, "field": "ref_date", "hasSummary": true},
    {"dataFormat": 5, "field": "item_code", "hasSummary": true},
    {"dataFormat": 5, "field": "item_name", "hasSummary": true},
    {"dataFormat": 4, "field": "quantity_in", "hasSummary": true},
    {"dataFormat": 4, "field": "quantity_out", "hasSummary": true},
    {"dataFormat": 4, "field": "quantity_balance", "hasSummary": true},
    {"dataFormat": 1, "field": "amount_balance", "hasSummary": true}
  ],
  "report_list": { ... }
}
```
