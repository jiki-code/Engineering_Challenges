# Claims Analytics Dashboard (AI Challenge 09)

Bảng điều khiển phân tích và giám sát yêu cầu bồi thường bảo hiểm y tế (Health Insurance Claims Analytics Dashboard) thời gian thực, xử lý 5,000 hồ sơ bồi thường với khả năng lọc đa chiều, drill-down tương tác và xuất báo cáo.

---

## 1. Định nghĩa KPI & Giả định nghiệp vụ (Locked Spec)

Để đảm bảo tính nhất quán và dễ kiểm chứng trong đánh giá hiệu năng:

| Chỉ số (KPI) | Công thức / Định nghĩa | Giải thích & Rationale |
|---|---|---|
| **Approval Rate** | `APPROVED ÷ (APPROVED + REJECTED)` | Chỉ tính trên các hồ sơ đã có quyết định dứt điểm. Hồ sơ `PENDING` và `IN_REVIEW` chưa duyệt xong nên **không đưa vào mẫu số** để tránh làm sai lệch tỷ lệ duyệt thực tế. |
| **Rejection Rate** | `REJECTED ÷ Tổng số claims` | Tính trên 100% tổng claim (bao gồm cả hồ sơ đang chờ) để phản ánh xác suất rủi ro bị từ chối của một hồ sơ khi nộp vào hệ thống (~15-16%). |
| **Total Approved Amount** | `∑ approved_amount` | Tổng số tiền đã thanh toán cho các hồ sơ `APPROVED`. Các hồ sơ khác luôn có `approved_amount = 0`. |
| **Avg Claim Amount** | `mean(submitted_amount)` | Số tiền yêu cầu bồi thường trung bình được nộp qua tất cả các hồ sơ trong bộ lọc. |
| **Avg Processing Time** | `mean(processed_date − submitted_date)` | Tính theo số ngày xử lý (1..30 ngày). Chỉ áp dụng cho hồ sơ có `processed_date` (`APPROVED` và `REJECTED`). Bỏ qua hồ sơ `PENDING` / `IN_REVIEW` vì chưa hoàn thành xử lý. |
| **Đơn vị tiền tệ** | Đơn vị tiền tệ chuẩn (THB-equivalent) | Giữ một đơn vị thống nhất toàn hệ thống để so sánh trực quan giữa các quốc gia mà không bị nhiễu do biến động tỷ giá. |
| **Bộ lọc ngày (Date Filter)** | Lọc theo `submitted_date` | Nhất quán với biểu đồ xu hướng tiếp nhận hồ sơ theo thời gian. |
| **Grouped Bar** | Insurer × Claim Type | 3 công ty bảo hiểm × 4 phân loại khám chữa bệnh (`OUTPATIENT`, `INPATIENT`, `DENTAL`, `MATERNITY`). |

---

## 2. Đặc tả dữ liệu (Synthetic Dataset — 5,000 dòng)

Dữ liệu được sinh bằng thuật toán phân phối thống kê tái lập với seed cố định (`seed=42`) trong file `data/generate_claims.js`:

- **Phân phối loại hình (claim_type):** OUTPATIENT 66.0%, INPATIENT 15.0%, DENTAL 11.9%, MATERNITY 7.1%.
- **Phân phối trạng thái (status):** APPROVED 64.2%, REJECTED 16.1%, PENDING 10.2%, IN_REVIEW 9.5%.
- **Phân phối quốc gia (country):** Thailand 39.8%, Vietnam 35.6%, Hong Kong 24.6%.
- **20 mã ICD-10 phân loại theo chuyên khoa:**
  - *OUTPATIENT (8)*: J06.9 (nhiễm trùng hô hấp trên), A09 (viêm ruột), K29.7 (viêm dạ dày), I10 (cao huyết áp), E11.9 (tiểu đường type 2), M54.5 (đau thắt lưng), R50.9 (sốt), N39.0 (nhiễm trùng tiểu).
  - *INPATIENT (5)*: A90 (sốt xuất huyết - tăng đột biến tháng 6-9), J18.9 (viêm phổi), K35.8 (viêm ruột thừa), I21.9 (nhồi máu cơ tim), S72.0 (gãy cổ xương đùi).
  - *DENTAL (4)*: K02.9 (sâu răng), K05.1 (viêm nướu), K04.7 (áp xe), K08.1 (mất răng).
  - *MATERNITY (3)*: O80 (sinh thường), O82 (mổ đẻ), Z34.0 (khám thai định kỳ).
- **Phân phối số tiền (submitted_amount):** Phân phối Lognormal theo nhóm bệnh tật, làm tròn theo bội số 50, cài sẵn các case bồi thường ngoại lệ (500,000 - 2,000,000) đối với các ca phẫu thuật phức tạp.
- **Thời gian xử lý (processed_date):** Phân phối Gamma lệch phải, trung bình toàn hệ thống ~6.66 ngày (khoảng 1 đến 30 ngày).
- **Insights cài sẵn (Data Stories):**
  - Insurer *Pacific Shield* có tỷ lệ duyệt khắt khe hơn (~73.9% so với Aurora ~83.5% và Mekong ~83.5%).
  - Assessor *Chen Wei* có thời gian thẩm định kỹ hơn (trung bình ~8.1 ngày so với các assessor khác ~6.1-6.4 ngày).
  - Chi phí bồi thường trung bình tại *Hong Kong* cao hơn đáng kể so với Thái Lan và Việt Nam.

---

## 3. Kiến trúc kỹ thuật (Tech Stack & Architecture)

- **Ngôn ngữ & Nền tảng:** React 18, TypeScript, Vite.
- **Thư viện biểu đồ:** Apache ECharts (`echarts`, `echarts-for-react`) — hỗ trợ responsive, hiệu năng cao khi render 5,000 điểm dữ liệu, hỗ trợ sự kiện click tương tác.
- **Bảng dữ liệu:** `@tanstack/react-table` v8 — hỗ trợ sắp xếp cột, phân trang tuỳ biến (10, 20, 50, 100), xuất CSV dữ liệu đang lọc.
- **Quản lý trạng thái:** `zustand` — lưu trữ trạng thái bộ lọc toàn cục gọn nhẹ, kích hoạt cập nhật đồng thời cho toàn bộ dashboard.
- **Xử lý CSV:** `papaparse` — parse CSV cực nhanh ngay trên Client, hỗ trợ tính năng thay thế dataset linh hoạt.
- **Kiểm thử tự động:** `vitest` — kiểm thử độc lập các hàm tính toán KPI thuần (pure functions) tại `src/utils/kpi.ts`.

---

## 4. Hướng dẫn chạy và tái lập dữ liệu

### 4.1. Tái tạo dữ liệu CSV (Node.js)
```bash
npm run generate:data
# CSV sẽ được tạo tại data/claims.csv và public/claims.csv
```

### 4.2. Cài đặt và chạy Dashboard (Frontend)
```bash
# Cài đặt dependencies
npm install

# Chạy unit test kiểm tra công thức KPI
npm test

# Chạy môi trường phát triển (Dev server)
npm run dev

# Đóng gói sản phẩm (Production Build)
npm run build
```

---

## 5. Các tính năng nổi bật
1. **Multi-dimensional Filtering:** Lọc đồng thời theo khoảng thời gian, loại bồi thường, công ty bảo hiểm, quốc gia và trạng thái.
2. **Interactive Drill-Down:** Nhấp chuột trực tiếp vào bất kỳ thanh mã bệnh ICD-10 nào trên biểu đồ Top 10 để khoanh vùng và lọc ngay lập tức bảng hồ sơ chi tiết bên dưới.
3. **Dynamic CSV Upload:** Cho phép người dùng tải lên tệp CSV mới bất kỳ lúc nào để cập nhật dữ liệu báo cáo mà không cần reload ứng dụng.
4. **Export Filtered Data:** Xuất tệp CSV chỉ chứa danh sách các hồ sơ bồi thường đang được hiển thị theo bộ lọc hiện tại.
