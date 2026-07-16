# 🔗 TÍCH HỢP DỮ LIỆU MISA VÀO POWER BI (MIRA DASHBOARD)

Tài liệu này cung cấp các đường dẫn dữ liệu (URL Raw GitHub) và hướng dẫn kỹ thuật để đồng bộ dữ liệu từ hệ thống trích xuất MISA vào Power BI.

---

## 1. Danh sách đường dẫn dữ liệu (GitHub Raw URL)

Các đường dẫn dưới đây được sử dụng để liên kết trực tiếp vào Power BI thông qua phương thức **Get Data -> Web**.

### 1.1 Dữ liệu Chi tiết Bán hàng (Order Detail)
*   **Mô tả:** Chi tiết doanh thu theo mặt hàng trích xuất từ MISA eShop.
*   **Đường dẫn tích hợp:**
    ```text
    https://raw.githubusercontent.com/hiLynnn/Mira-dashboard/main/output/order_detail.csv
    ```
*   **Trạng thái dữ liệu:** Dữ liệu lịch sử đã được đồng bộ đầy đủ từ ngày khai trương (28/10/2025) và tự động cập nhật tăng trưởng khi kích hoạt lệnh trích xuất.

### 1.2 Các báo cáo bổ sung (Cấu hình động)
Khi tích hợp thêm báo cáo mới bằng công cụ `import_curl.py`, dữ liệu sẽ được xuất ra các tệp tương ứng trong thư mục `output/`. Đường dẫn tích hợp vào Power BI sẽ có định dạng:
```text
https://raw.githubusercontent.com/hiLynnn/Mira-dashboard/main/output/<tên_báo_cáo>.csv
```

---

## 📝 Quy trình tích hợp vào Power BI Desktop

1. Khởi động ứng dụng **Power BI Desktop**.
2. Chọn **Get Data** (Lấy dữ liệu) -> chọn **Web**.
3. Dán đường dẫn URL tương ứng của báo cáo vào ô **URL** -> Chọn **OK**.
4. Thiết lập kiểu mã hóa đầu vào là **UTF-8 (Unicode)** để hiển thị đúng định dạng font tiếng Việt -> Chọn **Transform Data**.
5. Trong cửa sổ Power Query, thiết lập định dạng dữ liệu của các cột định danh (như `invoice_no`, `customer_tel`) là kiểu **Text (Văn bản)** để giữ các chữ số `0` ở đầu và tránh các lỗi chuyển đổi kiểu dữ liệu.
6. Thiết kế báo cáo và trực quan hóa dữ liệu.
7. Khi có dữ liệu mới được đồng bộ trên GitHub, chọn **Refresh** (Làm mới) trên thanh công cụ của Power BI để cập nhật số liệu.

---

## 🛠️ Quy trình thêm báo cáo mới từ MISA (Nhập cURL)

Để cấu hình và trích xuất thêm một báo cáo mới từ hệ thống MISA eShop:

1. Truy cập MISA eShop trên trình duyệt, mở công cụ phát triển **DevTools (F12)** -> Chuyển sang tab **Network** (Mạng).
2. Thực hiện thao tác tải hoặc xem báo cáo cần trích xuất trên giao diện MISA.
3. Tìm kiếm request có tên **`paging-filter`** -> Click chuột phải -> Chọn **Copy** -> **Copy as cURL (bash)**.
4. Tạo tệp tin **`curl.txt`** tại thư mục gốc của dự án này và dán toàn bộ nội dung lệnh cURL vừa sao chép vào.
5. Thực thi lệnh phân tích cURL trong terminal:
   ```bash
   python3 import_curl.py curl.txt <tên_báo_cáo>
   ```
   *(Ví dụ: `python3 import_curl.py curl.txt customer` hoặc `python3 import_curl.py curl.txt inventory`)*
   
   **Hệ thống sẽ tự động thực hiện:**
   * Phân tích cấu trúc payload, giải mã tham số base64 và tự động tạo file cấu hình job tương ứng tại `jobs/<tên_báo_cáo>.json` với các thiết lập tối ưu (`take: 500`, tự động xác định cột thời gian và khóa chính).
   * Cập nhật mã xác thực `bearer_token` cùng các tham số bảo mật mới nhất từ cURL vào `config.json`.
6. Thực thi lệnh trích xuất dữ liệu cho báo cáo mới:
   ```bash
   venv/bin/python3 run_all.py <tên_báo_cáo>
   ```
