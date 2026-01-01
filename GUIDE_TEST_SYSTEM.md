# 🎓 Hướng dẫn Hệ thống Bài Kiểm tra với Chống Gian lận

## 📋 Tổng quan

Hệ thống bài kiểm tra online hiện đại với tính năng chống gian lận toàn diện cho ứng dụng HappyClass.

---

## ✨ Tính năng chính

### 🔐 Chống gian lận
- ⏱️ **Giới hạn thời gian** - Countdown timer, tự động nộp bài khi hết giờ
- 👁️ **Theo dõi chuyển tab** - Đếm và cảnh báo khi học sinh chuyển tab/cửa sổ
- 🔒 **Chặn copy-paste** - Không cho copy nội dung đề bài
- 💾 **Tự động lưu** - Lưu bài làm mỗi 30 giây
- 🚫 **Chặn refresh** - Cảnh báo khi cố reload trang
- 📊 **Phân tích hành vi** - Phát hiện làm bài quá nhanh
- 🎲 **Trộn câu hỏi** - Mỗi học sinh có thứ tự câu hỏi khác nhau

### 👨‍🏫 Cho Giáo viên
- Tạo bài kiểm tra (trắc nghiệm + tự luận)
- Tự động chấm điểm trắc nghiệm
- Chấm điểm tự luận thủ công
- Dashboard phân tích chi tiết
- Xem bài làm từng học sinh
- Báo cáo gian lận

### 👨‍🎓 Cho Học sinh
- Giao diện làm bài fullscreen
- Hiển thị thời gian còn lại
- Đánh dấu câu đã/chưa trả lời
- Nhận điểm ngay sau khi nộp bài

---

## 🚀 Cách sử dụng

### **Giáo viên - Tạo bài kiểm tra**

1. **Đăng nhập** với tài khoản giáo viên
2. Click **"Bài kiểm tra"** ở menu bên trái
3. Click **"Tạo bài kiểm tra"**
4. Điền thông tin:
   - Môn học
   - Tiêu đề
   - Mô tả
   - Thời gian làm bài (phút)
   - Thời gian bắt đầu/kết thúc
5. Cài đặt chống gian lận:
   - ✅ Trộn câu hỏi ngẫu nhiên
   - Giới hạn chuyển tab (VD: 3 lần)
6. **Thêm câu hỏi**:
   - Click "Thêm câu hỏi"
   - Chọn loại: Trắc nghiệm hoặc Tự luận
   - Nhập câu hỏi và điểm số
   - Với trắc nghiệm: nhập 4 đáp án và chọn đáp án đúng
   - Với tự luận: nhập số từ tối thiểu
7. Click **"Tạo bài kiểm tra"**

### **Giáo viên - Xem kết quả**

1. Từ trang "Bài kiểm tra"
2. Click **"Phân tích"** để xem:
   - Điểm trung bình
   - Thời gian làm bài TB
   - Số học sinh gian lận
   - Biểu đồ phân bố điểm
   - Tỷ lệ đúng từng câu
3. Click **"Bài làm"** để:
   - Xem chi tiết bài làm từng học sinh
   - Chấm điểm câu tự luận
   - Xem cảnh báo gian lận

### **Học sinh - Làm bài kiểm tra**

1. **Đăng nhập** với tài khoản học sinh
2. Click **"Kiểm tra"** ở menu (desktop) hoặc bottom bar (mobile)
3. Chọn bài kiểm tra có trạng thái **"Có thể làm"**
4. Đọc kỹ **lưu ý quan trọng**:
   - ⚠️ Không chuyển tab/cửa sổ khác
   - ⚠️ Không copy/paste đề bài
   - ℹ️ Bài làm tự động lưu mỗi 30s
   - ℹ️ Hết giờ sẽ tự động nộp
5. Click **"Bắt đầu"**
6. Làm bài:
   - Trắc nghiệm: click chọn đáp án
   - Tự luận: gõ câu trả lời vào ô text
7. Click **"Nộp bài"** khi hoàn thành
8. Nhận điểm ngay lập tức

---

## ⚠️ Lưu ý khi làm bài

### **Học sinh CẦN TRÁNH:**
- ❌ Chuyển sang tab/app khác
- ❌ Copy đề bài ra ngoài
- ❌ Refresh/reload trang
- ❌ Đóng trình duyệt khi chưa nộp bài
- ❌ Làm bài quá nhanh (sẽ bị nghi ngờ)

### **Hệ thống SẼ GHI NHẬN:**
- Số lần chuyển tab
- Số lần thử copy
- Thời gian làm từng câu
- Tất cả hành vi bất thường

### **HẬU QUẢ:**
- Cảnh báo hiển thị trong bài làm
- Giáo viên nhận thông báo
- Có thể bị trừ điểm hoặc làm lại

---

## 📊 Phân tích kết quả

### **Dashboard Analytics**
- **Tổng quan**:
  - Số bài đã nộp / tổng số
  - Điểm trung bình
  - Thời gian làm bài TB
  - Số cảnh báo gian lận

- **Biểu đồ**:
  - Phân bố điểm số (0-2, 3-4, 5-6, 7-8, 9-10)
  
- **Phân tích câu hỏi**:
  - Tỷ lệ trả lời đúng từng câu
  - Câu nào khó/dễ
  - Số học sinh trả lời

### **Xem bài làm chi tiết**
- Điểm số từng phần
- Câu trả lời của học sinh
- Đáp án đúng (trắc nghiệm)
- Thời gian làm bài
- Số lần chuyển tab
- Cảnh báo gian lận

---

## 🎯 Best Practices

### **Cho Giáo viên:**
1. ✅ Test bài kiểm tra trước khi mở cho học sinh
2. ✅ Đặt thời gian hợp lý (không quá ngắn/dài)
3. ✅ Giới hạn chuyển tab: 2-5 lần (tùy độ khó)
4. ✅ Kết hợp trắc nghiệm + tự luận
5. ✅ Kiểm tra phân tích sau khi học sinh làm
6. ✅ Chấm điểm tự luận kịp thời

### **Cho Học sinh:**
1. ✅ Kiểm tra kết nối internet ổn định
2. ✅ Đóng tất cả tab không cần thiết
3. ✅ Đọc kỹ đề trước khi làm
4. ✅ Quản lý thời gian hợp lý
5. ✅ Làm bài trung thực

---

## 🔧 Technical Details

### **Files Structure:**
```
src/
├── services/mock/
│   └── testService.js          # API service
├── pages/teacher/
│   ├── Tests.jsx               # Danh sách bài kiểm tra
│   ├── TestAnalytics.jsx       # Phân tích kết quả
│   └── TestSubmissions.jsx     # Xem bài làm
└── pages/student/
    ├── Tests.jsx               # Danh sách bài kiểm tra
    └── TakeTest.jsx            # Làm bài (fullscreen)
```

### **Data Structure:**

**Test Object:**
```javascript
{
  id: string,
  classId: string,
  subject: string,
  title: string,
  description: string,
  type: 'TEST' | 'EXAM',
  duration: number, // minutes
  totalPoints: number,
  startAt: timestamp,
  endAt: timestamp,
  randomizeQuestions: boolean,
  allowCopyPaste: boolean,
  requireWebcam: boolean,
  maxTabSwitches: number,
  questions: Question[],
  createdBy: string,
  createdAt: timestamp
}
```

**Question Object:**
```javascript
{
  id: string,
  type: 'MULTIPLE_CHOICE' | 'ESSAY',
  question: string,
  options?: string[], // for MCQ
  correctAnswer?: number, // index for MCQ
  points: number,
  minWords?: number // for Essay
}
```

**Attempt Object:**
```javascript
{
  id: string,
  testId: string,
  studentId: string,
  startedAt: timestamp,
  endAt: timestamp,
  submittedAt?: timestamp,
  status: 'IN_PROGRESS' | 'SUBMITTED',
  earnedPoints: number,
  tracking: {
    tabSwitches: number,
    copyAttempts: number,
    pasteAttempts: number,
    suspiciousActivities: Activity[],
    lastActive: timestamp
  },
  cheatingFlags: CheatingFlag[],
  needsManualGrading: boolean
}
```

---

## 🐛 Troubleshooting

### **Vấn đề: Không thể bắt đầu bài kiểm tra**
- ✓ Kiểm tra thời gian bắt đầu/kết thúc
- ✓ Refresh trang và thử lại
- ✓ Đăng nhập lại

### **Vấn đề: Bài làm không được lưu**
- ✓ Kiểm tra kết nối internet
- ✓ Không refresh trang khi làm bài
- ✓ Hệ thống tự động lưu mỗi 30s

### **Vấn đề: Giáo viên không thấy bài làm**
- ✓ Đợi học sinh nộp bài xong
- ✓ Refresh trang danh sách bài làm

### **Vấn đề: Cảnh báo chuyển tab liên tục**
- ✓ Đóng tất cả tab khác
- ✓ Không click ra ngoài trình duyệt
- ✓ Không mở app khác khi làm bài

---

## 🚀 Future Enhancements

1. 📸 **Webcam Proctoring** - Chụp ảnh định kỳ
2. 🤖 **AI Detection** - Phát hiện người khác trong khung hình
3. 🔊 **Audio Monitoring** - Phát hiện tiếng nói
4. 📱 **Mobile App** - Làm bài trên điện thoại
5. 📤 **Export Reports** - Xuất kết quả Excel/PDF
6. 📧 **Email Notifications** - Thông báo tự động
7. 🎥 **Screen Recording** - Ghi màn hình khi làm bài
8. 🧠 **Question Bank** - Ngân hàng câu hỏi
9. 🔄 **Import/Export** - Import đề từ Word/Excel
10. 📊 **Advanced Analytics** - Phân tích học tập sâu hơn

---

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng liên hệ:
- GitHub Issues
- Email support

---

**Version:** 1.0.0  
**Last Updated:** January 1, 2026  
**Built with:** React + Vite + Tailwind CSS
