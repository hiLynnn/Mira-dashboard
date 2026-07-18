# 🔗 TÍCH HỢP DỮ LIỆU MISA VÀO POWER BI QUA GOOGLE BIGQUERY

Tài liệu này hướng dẫn cách kết nối Power BI trực tiếp tới Google BigQuery để tự động cập nhật dữ liệu.

---

## 1. Thông tin kết nối BigQuery
*   **Project ID:** `jda-k1`
*   **Dataset ID:** `vtnl_mira_data`
*   **Bảng dữ liệu hiện tại:** `order_detail`

---

## 📝 Quy trình tích hợp vào Power BI Desktop (Auto-refresh)

1. Khởi động ứng dụng **Power BI Desktop**.
2. Chọn **Get Data** (Lấy dữ liệu) -> Chọn **Google BigQuery** -> Nhấn **Connect**.
3. Đăng nhập bằng tài khoản Google có quyền truy cập vào Project `jda-k1`.
4. Trong cửa sổ Navigator:
   * Chọn Project: **`jda-k1`**
   * Chọn Dataset: **`vtnl_mira_data`**
   * Chọn bảng cần lấy: (Ví dụ: `order_detail`)
5. **Chọn Chế độ Kết nối (Connection Mode):**
   * **DirectQuery (Khuyến nghị):** Power BI sẽ truy vấn trực tiếp BigQuery mỗi khi bạn mở báo cáo. Dữ liệu luôn mới nhất, không cần cài đặt lịch làm mới (Scheduled Refresh) trên Power BI cloud.
   * **Import:** Power BI tải một bản sao dữ liệu về máy. Bạn cần cấu hình Scheduled Refresh trên Power BI Service để cập nhật định kỳ.
6. Chọn **Transform Data** để kiểm tra kiểu dữ liệu trong Power Query (đảm bảo các cột mã hóa như `invoice_no` có định dạng là **Text**).
7. Nhấn **Close & Apply**.

---

## 🛠️ Quy trình thêm báo cáo mới từ MISA vào BigQuery

Để cấu hình và trích xuất thêm một báo cáo mới từ hệ thống MISA eShop lên BigQuery:

1. **Tạo bảng đích trên BigQuery:**
   * Vào BigQuery Console, chọn dataset `vtnl_mira_data`.
   * Tạo bảng mới với đúng tên báo cáo (dạng `snake_case`, ví dụ: `inventory_summary`) và khai báo schema chuẩn của các cột (chú ý thiết lập các cột mã số là `STRING` và cột số tiền/số lượng là `FLOAT64` hoặc `NUMERIC`).

2. **Tạo cấu hình Job từ cURL:**
   * Mở DevTools (F12) trên trình duyệt khi tải báo cáo MISA -> Copy Request `paging-filter` dưới dạng **cURL (bash)**.
   * Lưu vào file `curl.txt` ở thư mục gốc.
   * Chạy lệnh tạo file job JSON:
     ```bash
     venv/bin/python3 import_curl.py curl.txt <tên_báo_cáo>
     ```
     *(Ví dụ: `venv/bin/python3 import_curl.py curl.txt inventory_summary`)*

3. **Thực thi trích xuất và đồng bộ lên BigQuery:**
   * Chạy lệnh:
     ```bash
     venv/bin/python3 run_all.py <tên_báo_cáo>
     ```
     Hệ thống sẽ tự động gọi API, lấy dữ liệu và chạy câu lệnh `MERGE` đẩy trực tiếp vào bảng tương ứng trên Google BigQuery.

