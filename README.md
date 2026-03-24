# Spy Time

Tai lieu tong hop nhanh de demo va gui giao vien review bo cau hoi/dap an cua tung ai trong game.

## Chay du an

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Tong quan cac ai hien co

- Ai 1 (1930): ghep 5 manh + cau hoi lich su + vong 2 giai 6 o chu.
- Ai 2 (1945): giai 3 mat thu Morse, sau do ghep dung 3 tu khoa vao 3 cho trong.
- Ai 3 (1975): phong tuyen nong trai, tru vung du 10 wave de mo ai tiep.
- Ai 4 Prep (ban do 1986): tra loi 5 cau hoi dia danh bang cach bam marker dung theo thu tu.
- Ai 4 (1986): soi UV thu clue va nhap mat lenh cuoi.

## Review cau hoi va dap an (theo code hien tai)

### Ai 1 - Mat lenh Cuu Long (1930)

Buoc 1: ghep 5 manh vao dung vi tri.

Buoc 2: cau hoi lich su

"Thang 5 nam 1930, Hoi nghi hop nhat ba to chuc cong san va thong qua Cuong linh chinh tri dau tien cua Dang Cong san Viet Nam da dien ra tai dia diem bi mat nao?"

Dap an duoc chap nhan:

- CUU LONG
- CUULONG
- CUU LONG (co dau cung duoc vi code co chuan hoa)
- HONG KONG
- HONGKONG

Luu y:

- Hien tai khong chap nhan bien the HUONG CANG cho cau hoi nay.

Buoc 3: vong 2 giai 6 o chu lich su

1. Giai doan 1936-1939 doi dan sinh, [...] va cai thien doi song.

- Dap an: DANCHU

2. Dai hoi Dang lan I nam 1935 dien ra o dau?

- Dap an: MACAO

3. Luc luong nao lan dau giu quyen lam chu tai mot so dia phuong (1930-1931)?

- Dap an: QUANCHUNG

4. Ten Mat tran thanh lap theo Hoi nghi TW8 (5/1941)?

- Dap an: VIETMINH

5. Phong trao [_______] Nghe Tinh.

- Dap an: XOVIET

6. Van ban 12/3/1945 "... Nhat - Phap ban nhau ..." la gi?

- Dap an: CHITHI

### Ai 2 - Mat tran 1945

Game 1: 3 cau do Morse

1. Mat thu 01

- Goi y: Lenh phat dong Tong khoi nghia toan quoc ngay 13/8/1945.
- Tin hieu: --.- ..- .- -. / .-.. . -. .... / ... --- / -- --- -
- Dap an chap nhan:
  - QUAN LENH SO MOT
  - QUAN LENH SO 1
- Tu khoa: Quan lenh so 1

2. Mat thu 02

- Goi y: Dia diem vua Bao Dai thoai vi ngay 30/8/1945.
- Tin hieu: -. --. --- / -- --- -.
- Dap an chap nhan:
  - NGO MON
- Tu khoa: Ngo Mon

3. Mat thu 03

- Goi y: Tu khoa bieu tuong cho su kien 2/9/1945.
- Tin hieu: -.. --- -.-. / .-.. .- .--.
- Dap an chap nhan:
  - DOC LAP
- Tu khoa: Doc lap

Game 2: ghep tu khoa vao cho trong

- Quan lenh so 1 -> moc 13/8/1945
- Ngo Mon -> moc 30/8/1945
- Doc lap -> moc 2/9/1945

Nguoi choi phai gan dung vi tri, sai vi tri se khong hoan tat ai.

### Ai 3 - Nong trai phong tuyen 1975

Day la ai chien thuat theo wave, khong co cau hoi tu luan.

Muc tieu thang:

- Tru vung du 10 wave (STAGE_1975_WAVE_TARGET = 10).

Dieu kien thua:

- Nhan vat chinh het mau (player hp = 0).

Ghi chu review:

- Day la phan danh gia nang luc van hanh chien thuat (quan ly tai nguyen + phong thu), khong phai bo cau hoi nhap dap an.

### Ai 4 Prep - Truy tim cong cu 1986 tren ban do

Co 5 cau hoi theo thu tu. Moi cau phai bam dung marker dia diem tren ban do. Bam sai 1 lan se reset toan bo vong.

5 dap an dung (theo thu tu):

1. Huong Cang
2. Tan Trao
3. Ba Dinh - Ha Noi
4. Ngo Mon - Hue
5. Sai Gon - Gia Dinh

Diem nhieu (khong dung):

- My Tho
- Nam Dinh
- Can Tho

Co che vat pham:

- Dung 3/5 -> nhan den UV.
- Dung 5/5 -> nhan nhat ky diep vu va mo ho so 1986.

### Ai 4 - Ho so buoc ngoat 1986

Nguoi choi soi UV trong so tay de lo clue, sau do ghep mat lenh cuoi.

3 clue cot loi:

- 12/1986
- DAI HOI VI
- DOI MOI TOAN DIEN

Quy tac ghep hien trong game:

- Lay so La Ma cua ky dai hoi.
- Noi tiep bang thang + nam.
- Khoa bang chu cai dau cua cum "Doi moi toan dien".

Dap an dung:

- VI-121986-DMTD

Luu y chap nhan bien the nhap:

- Ham chuan hoa bo dau, bo ky tu dac biet va khong phan biet hoa thuong,
  nen cac bien the nhu VI121986DMTD hoac vi-121986-dmtd van hop le.

## File doi chieu trong code

- src/pages/fragment-puzzle/ui/FragmentPuzzlePage.jsx
- src/features/time-travel-spy/lib/stage1945GameConfig.js
- src/features/time-travel-spy/ui/Stage1945MemoryRoom.jsx
- src/features/time-travel-spy/lib/stage1975GameConfig.js
- src/features/time-travel-spy/lib/stage1975Runtime.js
- src/features/time-travel-spy/lib/stage1986PrepConfig.js
- src/pages/time-travel-spy-prep/ui/Stage1986PrepMapPage.jsx
- src/features/time-travel-spy/ui/Stage1986Notebook.jsx
- src/features/time-travel-spy/lib/gameConfig.js

## Ban review chi tiet

- Ban tong hop chi tiet de gui giao vien: [REVIEW_CAU_HOI_TOAN_BO_AI.md](REVIEW_CAU_HOI_TOAN_BO_AI.md)
