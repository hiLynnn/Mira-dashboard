# 🔗 DANH SÁCH ĐƯỜNG DẪN IMPORT POWER BI (MIRA DASHBOARD)

Dưới đây là các đường dẫn (URL Raw GitHub) để bạn copy trực tiếp và dán vào Power BI (chọn **Get Data -> Web**).

---

## 1. Dữ liệu Chi tiết Bán hàng (Order Detail)
*   **Tên Báo Cáo:** Chi tiết doanh thu theo mặt hàng (MISA Eshop)
*   **Đường dẫn Import (Dán vào Power BI):**
    ```text
    https://raw.githubusercontent.com/hiLynnn/Mira-dashboard/main/output/order_detail.csv
    ```
*   **Trạng thái dữ liệu:** 
    *   Hiện tại: Đang có dữ liệu mẫu (~1,250 dòng) để thiết kế thử.
    *   Sắp tới: Dữ liệu thật đầy đủ từ ngày khai trương (28/10/2025) sẽ tự động ghi đè lên link này khi tiến trình tải ngầm hoàn tất.

---

## 2. Các Báo cáo Khác (Sẽ cập nhật khi cấu hình thêm)

*(Khi bạn cần lấy thêm báo cáo khác, chỉ cần copy curl request từ MISA gửi cho tôi, tôi sẽ tạo job và cập nhật link import mới vào bên dưới)*

*   **Tồn Kho (Inventory):**
    ```text
    (Chờ cập nhật URL)
    ```
*   **Khách Hàng (Customer):**
    ```text
    (Chờ cập nhật URL)
    ```
*   **Sản Phẩm (Product Catalog):**
    ```text
    (Chờ cập nhật URL)
    ```

---

## 📝 Hướng dẫn nhanh cách Import vào Power BI Desktop:
1. Mở Power BI Desktop.
2. Chọn **Get Data** (Lấy dữ liệu) -> chọn **Web**.
3. Copy đường link URL của báo cáo tương ứng ở trên và dán vào ô **URL** -> Nhấn **OK**.
4. Chọn kiểu dữ liệu đầu vào là **UTF-8 (Unicode)** để tránh lỗi font chữ tiếng Việt -> Chọn **Transform Data**.
5. Thực hiện thiết kế báo cáo.
6. Mỗi lần muốn cập nhật số liệu mới nhất: Chỉ cần chạy script Python trên máy rồi nhấn **Refresh** (Làm mới) trên Power BI.
