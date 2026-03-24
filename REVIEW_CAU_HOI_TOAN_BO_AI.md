# Tổng hợp câu hỏi và đáp án toàn bộ các ải (để gửi giáo viên review)

Ngày tổng hợp: 23/03/2026  
Dự án: spy_time

## 1) Mục đích tài liệu

Tài liệu này tổng hợp tất cả câu hỏi/nhiệm vụ có tính chất kiểm tra kiến thức trong website, kèm đáp án đúng theo code hiện tại để giáo viên đối chiếu.

## 2) Tổng quan nhanh theo từng ải

- Ải 1 (1930): 1 câu hỏi tự luận sau khi ghép mảnh giấy + vòng 2 ô chữ lịch sử.
- Ải 2 (1945): 3 câu đố Morse + 1 bước ghép từ khóa vào chỗ trống.
- Ải 3 (1975): Phòng tuyến nông trại, trụ vững 10 wave.
- Ải 4 Prep (bản đồ 1986): Chọn đúng 5 địa điểm lịch sử, sai là reset vòng.
- Ải 4 (1986): Soi UV lấy mảnh gợi ý và nhập mật lệnh cuối.

## 3) Chi tiết từng ải

### Ải 1 - Mật lệnh Cửu Long (1930)

Câu hỏi hiển thị trong game:
"Tháng 5 năm 1930, Hội nghị hợp nhất ba tổ chức cộng sản và thông qua Cương lĩnh chính trị đầu tiên của Đảng Cộng sản Việt Nam đã diễn ra tại địa điểm bí mật nào?"

Đáp án được chấp nhận trong code:

- CUU LONG
- CUULONG
- CỬU LONG
- HONG KONG
- HONGKONG

Lưu ý quan trọng:

- Code hiện tại KHÔNG chấp nhận "HUONG CANG" ở Ải 1.
- Nếu cần đúng theo sách giáo khoa/ngữ cảnh lịch sử, có thể bổ sung thêm biến thể "HUONG CANG" trong code sau.

Vòng 2 trong Ải 1 (ô chữ lịch sử):

Sau khi trả lời đúng câu hỏi địa điểm, người chơi tiếp tục giải 6 ô chữ. Dưới đây là câu hỏi hiển thị trong game và đáp án đúng theo code:

1. Câu hỏi:
   "Trong giai đoạn 1936-1939, Đảng đã dẫn dắt phong trào đấu tranh đòi dân sinh, [...] và cải thiện đời sống."

Đáp án đúng: DANCHU

2. Câu hỏi:
   "Đại hội Đảng lần I năm 1935 nhằm khôi phục tổ chức sau thời kỳ bị đàn áp được diễn ra tại đâu?"

Đáp án đúng: MACAO

3. Câu hỏi:
   "Lực lượng nào lần đầu tiên giành được quyền làm chủ ở một số địa phương trong phong trào 1930-1931?"

Đáp án đúng: QUANCHUNG

4. Câu hỏi:
   "Tên tổ chức Mặt trận được thành lập theo quyết định của Hội nghị Trung ương 8 (5/1941) để mở rộng lực lượng?"

Đáp án đúng: VIETMINH

5. Câu hỏi:
   "Phong trào [_______] Nghệ Tĩnh được coi là đỉnh cao của cách mạng những năm 1930-1931."

Đáp án đúng: XOVIET

6. Câu hỏi:
   "Tên gọi của loại văn bản được ban hành ngày 12/3/1945 ('... Nhật - Pháp bắn nhau...') nhằm chuẩn bị trực tiếp cho Tổng khởi nghĩa?"

Đáp án đúng: CHITHI

---

### Ải 2 - Mặt trận 1945

#### Game 1: Giải 3 mật thư Morse

1. Mật thư 01

- Gợi ý: "Lệnh phát động Tổng khởi nghĩa toàn quốc vào ngày 13/8/1945."
- Tín hiệu Morse: `--.- ..- .- -. / .-.. . -. .... / ... --- / -- --- -`
- Đáp án chấp nhận:
  - QUAN LENH SO MOT
  - QUAN LENH SO 1
- Từ khóa thu được: "Quân lệnh số 1"

2. Mật thư 02

- Gợi ý: "Địa điểm vua Bảo Đại thoái vị vào ngày 30/8/1945."
- Tín hiệu Morse: `-. --. --- / -- --- -.`
- Đáp án chấp nhận:
  - NGO MON
- Từ khóa thu được: "Ngọ Môn"

3. Mật thư 03

- Gợi ý: "Từ khóa biểu tượng cho sự kiện ngày 2/9/1945 và màn cuối của room 1945."
- Tín hiệu Morse: `-.. --- -.-. / .-.. .- .--.`
- Đáp án chấp nhận:
  - DOC LAP
- Từ khóa thu được: "Độc lập"

#### Game 2: Liên kết từ khóa vào chỗ trống

Người chơi phải đặt đúng 3 từ khóa đã giải vào 3 chỗ trống trong các thẻ thông tin:

- Quân lệnh số 1 -> đoạn thông tin ngày 13/8/1945
- Ngọ Môn -> đoạn thông tin ngày 30/8/1945
- Độc lập -> đoạn thông tin ngày 2/9/1945

Lưu ý:

- Đây là bước đúng/sai theo đúng vị trí, không phải câu hỏi tự luận nhập text mới.

---

### Ải 3 - Nông trại phòng tuyến 1975

Yêu cầu nhiệm vụ:

- Đây là ải chiến thuật thời gian thực, không có câu hỏi nhập text.
- Người chơi vừa sản xuất lương thực vừa phòng thủ hàng rào.
- Mục tiêu hoàn tất: trụ vững đủ 10 wave (STAGE_1975_WAVE_TARGET = 10).

Điều kiện thua:

- Nhân vật chính hết HP.

Kết quả khi thắng:

- Mở đường sang màn chuẩn bị hồ sơ 1986 (map prep).

---

### Ải 4 Prep - Truy tìm công cụ 1986 trên bản đồ

Yêu cầu nhiệm vụ:

- Chọn đúng 5 địa điểm then chốt trên bản đồ dựa vào hồ sơ các ải trước.
- Nếu bấm nhầm 1 điểm sai -> reset toàn bộ vòng dò tìm.

5 địa điểm ĐÚNG (target=true):

- Hương Cảng
- Tân Trào
- Ba Đình - Hà Nội
- Ngọ Môn - Huế
- Sài Gòn - Gia Định

Điểm NHIỄU (không đúng):

- Mỹ Tho
- Nam Định
- Cần Thơ

Cơ chế vật phẩm:

- Đạt đúng 3/5 -> nhận đèn UV.
- Đạt đúng 5/5 -> nhận nhật ký điệp vụ và mở được hồ sơ 1986.

---

### Ải 4 - Hồ sơ bước ngoặt 1986

Người chơi soi UV để lấy các gợi ý ẩn, sau đó ghép mật lệnh cuối.

3 gợi ý UV cốt lõi:

- 12/1986
- ĐẠI HỘI VI
- ĐỔI MỚI TOÀN DIỆN

Quy tắc ghép mật lệnh (hiển thị trong game):

- Lấy số La Mã của kỳ đại hội quyết định.
- Nối tiếp bằng tháng và năm ở thời điểm chốt hướng đi.
- Khóa lại bằng chữ cái đầu của cụm từ: Đổi mới toàn diện.

Đáp án đúng theo code:

- VI-121986-DMTD

Các biến thể nhập vẫn được chấp nhận (do hàm chuẩn hóa bỏ dấu, bỏ ký tự đặc biệt, không phân biệt hoa thường):

- VI121986DMTD
- vi-121986-dmtd
- V I - 1 2 / 1 9 8 6 - D M T D

Lưu ý:

- Sai mật lệnh ở Ải 4 sẽ hiện thông báo: cần ghép theo số đại hội + thời điểm + chữ cái đầu cụm khóa.

## 4) Điểm cần giáo viên xác nhận

- Tính chính xác lịch sử của câu hỏi Ải 1 (mốc địa điểm hội nghị hợp nhất 1930).
- Tính chuẩn xác của 3 từ khóa Morse ở Ải 2.
- Tính phù hợp của quy tắc ghép mật lệnh Ải 3 với nội dung giảng dạy (VI + 12/1986 + DMTD).
- Có cần chấp nhận thêm biến thể "HUONG CANG" ở Ải 1 hay giữ nguyên bộ đáp án hiện tại.

## 5) Nguồn đối chiếu trong code

- src/pages/fragment-puzzle/ui/FragmentPuzzlePage.jsx
- src/features/time-travel-spy/lib/stage1945GameConfig.js
- src/features/time-travel-spy/ui/Stage1945MemoryRoom.jsx
- src/features/time-travel-spy/lib/stage1975GameConfig.js
- src/features/time-travel-spy/lib/stage1975Runtime.js
- src/features/time-travel-spy/lib/stage1986PrepConfig.js
- src/pages/time-travel-spy-prep/ui/Stage1986PrepMapPage.jsx
- src/features/time-travel-spy/ui/Stage1986Notebook.jsx
- src/features/time-travel-spy/lib/gameConfig.js
- src/pages/time-travel-spy/ui/TimeTravelSpyPage.jsx

---

Nếu bạn muốn, mình có thể tạo thêm 1 bản "để in" (rút gọn 1 trang A4) chỉ gồm: Câu hỏi - đáp án - mục tiêu kiến thức của từng ải.
