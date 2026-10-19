# Policy Summary Generator (AI Challenge 05)

Hệ thống nhận dữ liệu JSON hợp đồng bảo hiểm và tạo trang tóm tắt trực quan, dễ đọc, sẵn sàng in/xuất PDF với thiết kế chuyên nghiệp.

---

## 🌟 Tính năng chính

1. **Chuẩn hóa & Định dạng Đa tiền tệ**:
   - Tự động nhận diện ký hiệu tiền tệ và định dạng số phân cách hàng nghìn theo chuẩn quốc tế (`Intl.NumberFormat`) cho THB (`฿`), USD (`$`), VND (`₫`), v.v.
   - Định dạng ngày tháng rõ ràng (`DD MMM YYYY`).

2. **Ánh xạ trường giới hạn động (Dynamic Limit Mapping)**:
   - **Không hard-code** tên sub-benefit hay key giới hạn.
   - Tự động nhận diện bằng pattern matching mọi key dạng `limit_per_*` (`limit_per_day`, `limit_per_event`, `limit_per_visit`, `limit_per_year`, `limit_per_pregnancy`, v.v.) và các điều kiện đi kèm `max_*` (`max_days`, `visits_per_year`).

3. **Phân biệt rạch ròi Annual Limit vs Lifetime Limit**:
   - Thẻ tham khảo nhanh (Quick Reference) tách biệt `annual_limit` và `lifetime_limit`.
   - Các quyền lợi dùng ngân sách trọn đời (như Thai sản / Maternity) được tổng kết riêng biệt, không cộng gộp sai lệch vào hạn mức năm.

4. **Hệ thống cảnh báo thị giác nhất quán trên toàn trang**:
   - ⏱️ **Thời gian chờ (Waiting Periods)**: Badge và khung cảnh báo nổi bật với **icon đồng hồ (`⏱️`)** và **nền vàng/amber** (`bg-amber-50`, `border-amber-200`, `text-amber-900`). Xuất hiện đồng bộ từ Thẻ tham khảo nhanh, chip trên từng quyền lợi, đến bảng chi tiết thời gian chờ.
   - ⚠️ **Các trường hợp loại trừ (Exclusions)**: Khung cảnh báo với **icon cảnh báo (`⚠️`)** và **nền đỏ nhạt** (`bg-red-50`, `border-red-200`, `text-red-900`) giúp người tham gia bảo hiểm nhận biết ngay các rủi ro không được chi trả.

5. **Dữ liệu mẫu đa dạng với các ca kiểm thử có chủ đích (Sample Policies)**:
   - **Mẫu 1 (`sample-corporate-health.json`)**: Hợp đồng doanh nghiệp Thái Lan (THB) từ đề bài — 4 quyền lợi, đồng chi trả, 2 thời gian chờ (Dental 90 ngày, Maternity 270 ngày), 3 quốc gia.
   - **Mẫu 2 (`sample-family-custom.json`)**: Hợp đồng gia đình tại Việt Nam (**VND**):
     - Có nhóm quyền lợi mới: **`VISION`** (Nhãn khoa/Kính thuốc) & **`WELLNESS`** (Khám sức khỏe tổng quát/Tiêm chủng).
     - Đồng chi trả phân tầng: Nội trú 0%, Ngoại trú 15% (kèm trần 300.000₫/lần), Vision 10%, Wellness áp dụng mức phí cố định (`flat_fee: 100.000₫`).
     - **Không có bất kỳ thời gian chờ nào** (`waiting_period_days: undefined`) → kiểm thử việc ẩn/xử lý mượt mà khi không có waiting period.
     - **Khuyết trường `industry`** (`policyholder.industry: undefined`) → kiểm thử việc xử lý trường tùy chọn không gây lỗi giao diện.
   - **Mẫu 3 (`sample-sme-global.json`)**: Hợp đồng SME toàn cầu (**USD**):
     - Chủ hợp đồng là doanh nghiệp công nghệ tài chính SME (45 nhân viên).
     - Có **`lifetime_limit`**: Quyền lợi Bệnh hiểm nghèo (`$500,000`) và Vận chuyển cấp cứu (`$1,000,000`).
     - **Quyền lợi KHÔNG có `sub_benefits`**: Quyền lợi `CRITICAL_ILLNESS` và `ACCIDENTAL_DEATH` chỉ có hạn mức tổng thể không chia nhỏ sub-benefit → hệ thống tự động nhận diện và hiển thị chế độ *"Full Blanket Coverage"* trực quan.
     - **Danh sách loại trừ rất dài (13 mục)** kiểm tra khả năng co giãn bố cục, không bị tràn trang.
     - **Mạng lưới bao phủ toàn cầu** với 10 quốc gia và 8.500 bệnh viện.
   - **Mẫu 4 (`sample-individual-travel.json`)**: Bảo hiểm du lịch cá nhân quốc tế (USD), không có thành viên, không copay.

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy môi trường phát triển (Dev)
npm run dev
# Truy cập http://localhost:3000

# 3. Build sản xuất (Production)
npm run build
npm run start
```

---

## 📁 Cấu trúc thư mục

```
Challenge_05/
├── app/
│   ├── globals.css              # Theme CSS: .badge-waiting, .alert-waiting, .alert-exclusion
│   ├── layout.tsx               # Root Layout
│   ├── page.tsx                 # Trang chủ: upload JSON, chọn sample, validate
│   └── summary/
│       └── page.tsx             # Trang hiển thị bản tóm tắt
├── src/
│   ├── components/
│   │   ├── ActionToolbar.tsx    # Nút In / Xuất PDF, đổi hợp đồng
│   │   ├── BenefitsTable.tsx    # Bảng quyền lợi (chip ⏱️ nền vàng)
│   │   ├── CopayTable.tsx       # Bảng đồng chi trả
│   │   ├── ExclusionsList.tsx   # Danh sách loại trừ (icon ⚠️ nền đỏ nhạt)
│   │   ├── MembersBreakdown.tsx # Phân tích số lượng nhân viên & người phụ thuộc
│   │   ├── NetworkInfo.tsx      # Danh sách cơ sở y tế & quốc gia áp dụng
│   │   ├── PolicyOverview.tsx   # Tổng quan hợp đồng & chủ hợp đồng
│   │   ├── QuickReferenceCard.tsx# Thẻ tham khảo nhanh (tổng hạn mức, copay, notice bar)
│   │   ├── SummaryHeader.tsx    # Header & banner cảnh báo hết hạn
│   │   └── WaitingPeriods.tsx   # Chi tiết thời gian chờ (icon ⏱️ nền vàng)
│   ├── lib/
│   │   ├── format.ts            # Dynamic regex limit mapper, Intl currency & date formatters
│   │   ├── normalize.ts         # Chuẩn hóa dữ liệu thô sang render-ready model
│   │   └── schema.ts            # Parser & validator JSON
│   └── types/
│       └── policy.ts            # TypeScript interfaces
├── data/                        # 3 file JSON chính sách mẫu
│   ├── sample-corporate-health.json
│   ├── sample-individual-travel.json
│   └── sample-family-comprehensive.json
└── public/samples/              # Bản sao phục vụ demo tải nhanh
```
