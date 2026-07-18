---
name: add_misa_report
description: >
  Hướng dẫn thêm một báo cáo MISA mới để export ra CSV và tích hợp vào Power BI.
  Trigger khi user yêu cầu: "thêm báo cáo mới", "thêm api", "export report mới",
  "thêm job", "tích hợp báo cáo", "thêm nguồn dữ liệu Power BI".
---

# Skill: Thêm báo cáo MISA mới (add_misa_report)

## Mục tiêu
Hướng dẫn từng bước để thêm một API báo cáo MISA mới vào hệ thống, từ lúc lấy cURL cho đến khi Power BI đọc được dữ liệu.

Tham khảo thêm chi tiết kỹ thuật tại: `references/job_schema.md` và `references/troubleshooting.md`.

---

## Quy trình 4 bước

### Bước 1 – Lấy cURL từ MISA eShop

1. Truy cập `https://eshopapp.misa.vn` → đăng nhập.
2. Mở báo cáo cần thêm (ví dụ: Báo cáo Tồn kho, Công nợ khách hàng...).
3. Nhấn **F12** → tab **Network** → lọc theo từ khóa **`paging-filter`**.
4. Click vào request đó → chuột phải → **Copy as cURL (bash)**.
5. Tạo file `curl.txt` tại thư mục gốc dự án, dán nội dung vào.

---

### Bước 2 – Tạo Job JSON bằng `import_curl.py`

```bash
venv/bin/python3 import_curl.py curl.txt <tên_báo_cáo>
```

> **Quy tắc đặt tên:** dùng `snake_case`, viết thường, không dấu.  
> Ví dụ: `inventory`, `customer_debt`, `revenue_summary`

Sau khi chạy, tool sẽ tự động:
- Tạo file `jobs/<tên_báo_cáo>.json` với cấu hình đầy đủ.
- Cập nhật `bearer_token` và headers bảo mật vào `config.json`.

**Kiểm tra file vừa tạo** và điều chỉnh nếu cần (xem schema tại `references/job_schema.md`):
- `date_field`: cột dùng để xác định ngày (phải có trong `columns`).
- `unique_keys`: khóa để dedup khi incremental update.
- `take`: số records/trang (mặc định 500, không cần thay đổi).

---

### Bước 3 – Chạy export lần đầu

```bash
venv/bin/python3 run_all.py <tên_báo_cáo>
```

- File CSV sẽ được tạo tại `output/<tên_báo_cáo>.csv`.
- Script sẽ tự động commit và push lên GitHub.

**Kiểm tra log:** Nếu thấy `❌` hoặc lỗi, xem hướng dẫn tại `references/troubleshooting.md`.

---

### Bước 4 – Cập nhật tài liệu & Power BI

#### 4a. Cập nhật `POWERBI_LINKS.md`
Thêm mục mới vào section "Danh sách đường dẫn dữ liệu":

```markdown
### 1.X Tên báo cáo mới
*   **Mô tả:** [Mô tả ngắn về báo cáo]
*   **Đường dẫn tích hợp:**
    ```text
    https://raw.githubusercontent.com/hiLynnn/Mira-dashboard/main/output/<tên_báo_cáo>.csv
    ```
*   **Trạng thái dữ liệu:** [Mô tả khoảng thời gian dữ liệu]
```

#### 4b. Kết nối vào Power BI
1. Power BI Desktop → **Get Data** → **Web**.
2. Dán URL raw GitHub ở trên.
3. Encoding: **UTF-8**.
4. Trong Power Query: set kiểu **Text** cho các cột mã số (`invoice_no`, `customer_code`, v.v.).
5. **Close & Apply** → dữ liệu đã sẵn sàng.

---

## Checklist hoàn chỉnh

- [ ] Đã lấy cURL từ MISA và tạo `curl.txt`
- [ ] Đã chạy `import_curl.py` → tạo `jobs/<tên>.json` thành công
- [ ] Đã kiểm tra `date_field` và `unique_keys` trong file job
- [ ] Đã chạy `run_all.py` → `output/<tên>.csv` được tạo
- [ ] Script đã tự động push lên GitHub thành công
- [ ] Đã cập nhật `POWERBI_LINKS.md` với URL mới
- [ ] Đã kết nối URL vào Power BI và Refresh thành công
