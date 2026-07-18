---
name: add_misa_report
description: >
  Hướng dẫn thêm một báo cáo MISA mới để export ra CSV và tích hợp vào Power BI thông qua Google BigQuery.
  Trigger khi user yêu cầu: "thêm báo cáo mới", "thêm api", "export report mới",
  "thêm job", "tích hợp báo cáo", "thêm nguồn dữ liệu Power BI".
---

# Skill: Thêm báo cáo MISA mới (add_misa_report)

## Mục tiêu
Hướng dẫn từng bước để thêm một API báo cáo MISA mới vào hệ thống, từ lúc lấy cURL cho đến khi đồng bộ trực tiếp lên BigQuery.

Tham khảo thêm chi tiết kỹ thuật tại: `references/job_schema.md` và `references/troubleshooting.md`.

---

## Quy trình 4 bước

### Bước 1 – Tạo Bảng Đích trên BigQuery trước

1. Vào Google Cloud Console -> **BigQuery**.
2. Chọn dataset **`vtnl_mira_data`** của project **`jda-k1`**.
3. Tạo bảng trống (Create Table) với tên báo cáo (dạng `snake_case`, ví dụ: `inventory_summary`).
4. Khai báo schema chi tiết của các cột (chú ý: các cột mã số như `invoice_no` phải là `STRING`, cột số tiền/số lượng là `FLOAT64`).

---

### Bước 2 – Lấy cURL & Tạo Job JSON

1. Truy cập `https://eshopapp.misa.vn` → đăng nhập.
2. Mở báo cáo cần thêm và tải dữ liệu.
3. Nhấn **F12** → tab **Network** → lọc theo từ khóa **`paging-filter`**.
4. Click vào request đó → chuột phải → **Copy as cURL (bash)**.
5. Tạo file `curl.txt` tại thư mục gốc dự án, dán nội dung vào.
6. Tạo Job JSON bằng lệnh:
   ```bash
   venv/bin/python3 import_curl.py curl.txt <tên_báo_cáo>
   ```
   *(Tên báo cáo trùng với tên bảng vừa tạo ở Bước 1, ví dụ: `inventory_summary`)*

---

### Bước 3 – Chạy đồng bộ lên BigQuery

```bash
venv/bin/python3 run_all.py <tên_báo_cáo>
```

- Hệ thống sẽ gọi API MISA, lưu file CSV backup tại `output/<tên_báo_cáo>.csv`.
- Script tự động kết nối BigQuery bằng ADC, đọc schema bảng đích và chạy `MERGE` để upsert dữ liệu mới vào BigQuery.

**Kiểm tra log:** Nếu thấy `❌` hoặc lỗi, xem hướng dẫn tại `references/troubleshooting.md`.

---

### Bước 4 – Kết nối Power BI

1. Power BI Desktop → **Get Data** → **Google BigQuery**.
2. Đăng nhập tài khoản Google của bạn.
3. Chọn Project `jda-k1` -> Dataset `vtnl_mira_data` -> Chọn bảng mới.
4. Chọn chế độ kết nối **DirectQuery** (hoặc **Import** nếu cần scheduled refresh).
5. Xác nhận dữ liệu hiển thị chính xác.

---

## Checklist hoàn chỉnh

- [ ] Đã tạo bảng đích trên BigQuery console với đúng schema
- [ ] Đã lấy cURL từ MISA và tạo `curl.txt`
- [ ] Đã chạy `import_curl.py` → tạo `jobs/<tên>.json` thành công
- [ ] Đã chạy `run_all.py` → dữ liệu được MERGE thành công vào BigQuery
- [ ] Đã kết nối và kiểm tra bảng dữ liệu mới trên Power BI Desktop

