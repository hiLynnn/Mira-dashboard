# Mira Dashboard – Project Rules

## Tổng quan kiến trúc

Đây là hệ thống **tự động trích xuất dữ liệu từ MISA eShop API** và đưa lên GitHub để Power BI đọc qua GitHub Raw URL.

```
Mira dashboard/
├── config.json          # Cấu hình CHUNG: token, API URL, headers bảo mật
├── jobs/                # Mỗi file .json = 1 báo cáo cần export
│   └── order_detail.json
├── output/              # File CSV đầu ra (được commit lên GitHub)
│   └── order_detail.csv
├── misa_exporter.py     # Engine lõi – KHÔNG CHỈNH SỬA
├── run_all.py           # Script chạy: python run_all.py [tên_job]
└── import_curl.py       # Tiện ích tạo job từ cURL
```

## Rules bắt buộc

### R1 – Không chỉnh sửa engine lõi
- File `misa_exporter.py` là **engine dùng chung**, không được sửa khi chỉ thêm báo cáo mới.
- Nếu cần thay đổi logic chung (ví dụ: thêm retry, thay đổi pagination), phải cẩn thận vì ảnh hưởng tất cả jobs.

### R2 – Mỗi báo cáo = 1 file JSON trong `jobs/`
- Tên file phải là `snake_case`, ví dụ: `inventory_summary.json`, `customer_debt.json`.
- Không dùng ký tự đặc biệt, dấu cách, hay tiếng Việt trong tên file.

### R3 – Giữ nguyên cấu trúc `config.json`
- Không thêm thông tin nhạy cảm mới vào `config.json` mà không có `_comment` giải thích.
- Chỉ các trường sau được phép tồn tại: `bearer_token`, `api_url`, `x_device_id`, `x_ms_bid`, `x_ems_context`, `v_from_date`, `auto_date_to_today`, `incremental`.

### R4 – Sau mỗi job mới, phải cập nhật `POWERBI_LINKS.md`
- Thêm mục mới với URL raw GitHub tương ứng: `https://raw.githubusercontent.com/hiLynnn/Mira-dashboard/main/output/<tên_job>.csv`

### R5 – Luôn dùng `venv/bin/python3` để chạy script
- Đúng: `venv/bin/python3 run_all.py`
- Sai: `python3 run_all.py` (có thể dùng Python hệ thống, thiếu thư viện `requests`)
