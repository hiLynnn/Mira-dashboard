# Troubleshooting – Xử lý lỗi thường gặp

## ❌ Lỗi 401 Unauthorized / Token hết hạn

**Triệu chứng:**
```
[job_name] ❌ Token hết hạn (401/422). Cập nhật 'bearer_token' trong config.json.
```

**Nguyên nhân:** Bearer token MISA có thời hạn ~24h, hết hạn sau mỗi phiên.

**Cách xử lý:**
1. Vào `https://eshopapp.misa.vn` → đăng nhập.
2. F12 → Network → tìm request `paging-filter`.
3. Trong tab **Headers**, copy giá trị của header `authorization` (bỏ chữ `Bearer ` ở đầu).
4. Paste vào `config.json` trường `bearer_token`.

**Cách nhanh nhất – dùng import_curl.py:**
```bash
# Lưu cURL mới vào curl.txt (copy từ DevTools), rồi chạy:
venv/bin/python3 import_curl.py curl.txt <tên_job_hiện_có>
# Script sẽ tự cập nhật token và KHÔNG ghi đè file job
```

---

## ❌ Lỗi parse cURL

**Triệu chứng:**
```
[ERROR] Không thể parse dữ liệu payload JSON
```

**Nguyên nhân:** cURL được copy không đúng format, thiếu `--data-raw`.

**Cách xử lý:**
- Đảm bảo copy **Copy as cURL (bash)** chứ không phải "Copy as fetch".
- Kiểm tra `curl.txt` có chứa `--data-raw '{"report_id":...}'` không.
- Nếu cURL có ký tự escape `\'`, thử thay bằng `"`.

---

## ❌ Không có dữ liệu trả về (0 records)

**Triệu chứng:**
```
[job_name] ⚠️ Không có dữ liệu nào được trả về.
```

**Nguyên nhân có thể:**
1. `v_from_date` > `v_to_date` (ngày bắt đầu sau ngày kết thúc).
2. `v_branch_ids` sai – không khớp với chi nhánh có dữ liệu.
3. Báo cáo đòi hỏi tham số bổ sung không có trong job.

**Cách xử lý:**
1. Kiểm tra `parameters` trong file job, đặc biệt `v_from_date` và `v_to_date`.
2. Thử chạy báo cáo trực tiếp trên MISA với cùng bộ lọc → xác nhận có dữ liệu.
3. Nếu file CSV cũ đã chứa dữ liệu tương lai (do `date_field` sai), xóa CSV và chạy lại.

---

## ❌ Incremental update lấy sai mốc ngày

**Triệu chứng:** Mỗi lần chạy đều lấy từ đầu hoặc bỏ sót dữ liệu.

**Nguyên nhân:** `date_field` trong job không đúng với tên cột trong CSV.

**Cách xử lý:**
1. Mở `output/<tên_job>.csv` → xem tên cột thực tế.
2. Đối chiếu với `columns[].field` trong job JSON.
3. Sửa `date_field` trong job để khớp chính xác.

---

## ❌ Lỗi push GitHub

**Triệu chứng:**
```
⚠️ Không thể đẩy dữ liệu lên GitHub tự động
```

**Nguyên nhân có thể:**
- Git credentials chưa được cấu hình trên máy.
- SSH key chưa được thêm vào GitHub.

**Cách xử lý (HTTPS + Personal Access Token):**
```bash
git config --global credential.helper store
git push origin main
# Nhập username và PAT (Personal Access Token) khi được hỏi
```

**Cách xử lý (SSH):**
```bash
ssh-keygen -t ed25519 -C "email@example.com"
# Copy public key → GitHub → Settings → SSH Keys → Add
```

---

## ❌ Timeout khi lấy dữ liệu

**Triệu chứng:** Script bị treo hoặc báo timeout ở một trang nào đó.

**Cách xử lý:**
1. Giảm `take` trong file job từ 500 xuống 200 hoặc 100.
2. Tăng `request_timeout` trong `config.json` (mặc định 60 giây):
   ```json
   "request_timeout": 120
   ```
3. Tăng `rate_limit_sleep` để giảm tần suất gọi API:
   ```json
   "rate_limit_sleep": 1.0
   ```

---

## ℹ️ Xóa và tải lại toàn bộ dữ liệu

Nếu muốn bỏ qua incremental và tải lại từ đầu:
```bash
rm output/<tên_job>.csv
venv/bin/python3 run_all.py <tên_job>
```

Hoặc tắt incremental tạm thời trong `config.json`:
```json
"incremental": false
```
*(Nhớ đặt lại `true` sau khi xong)*
