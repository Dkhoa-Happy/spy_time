const MAP_LOCATIONS = [
  {
    id: "huong-cang",
    name: "Hương Cảng",
    period: "1930",
    event: "Hội nghị thành lập Đảng đầu năm 1930",
    coordinates: { lat: 22.3193, lng: 114.1694 },
    mapPosition: { top: "68%", left: "17%" },
    target: true,
    sourceStage: "Stage 1",
  },
  {
    id: "tan-trao",
    name: "Tân Trào",
    period: "1945",
    event: "Căn cứ phát lệnh tổng khởi nghĩa",
    coordinates: { lat: 22.3888, lng: 105.5187 },
    mapPosition: { top: "39%", left: "63%" },
    target: true,
    sourceStage: "Stage 2",
  },
  {
    id: "ha-noi",
    name: "Ba Đình - Hà Nội",
    period: "1945",
    event: "Nơi đọc Tuyên ngôn Độc lập",
    coordinates: { lat: 21.0369, lng: 105.8342 },
    mapPosition: { top: "34%", left: "69%" },
    target: true,
    sourceStage: "Stage 2",
  },
  {
    id: "ngo-mon",
    name: "Ngọ Môn - Huế",
    period: "1945",
    event: "Bảo Đại thoái vị",
    coordinates: { lat: 16.4669, lng: 107.5787 },
    mapPosition: { top: "56%", left: "72%" },
    target: true,
    sourceStage: "Stage 2",
  },
  {
    id: "hcm-city",
    name: "Sài Gòn - Gia Định",
    period: "1945",
    event: "Trung tâm giành chính quyền ở Nam Bộ",
    coordinates: { lat: 10.8231, lng: 106.6297 },
    mapPosition: { top: "78%", left: "78%" },
    target: true,
    sourceStage: "Stage 2",
  },
  {
    id: "my-tho",
    name: "Mỹ Tho",
    period: "1945",
    event: "Điểm nhiễu không thuộc hồ sơ chính",
    coordinates: { lat: 10.36, lng: 106.3596 },
    mapPosition: { top: "82%", left: "68%" },
    target: false,
    sourceStage: "Decoy",
  },
  {
    id: "nam-dinh",
    name: "Nam Định",
    period: "1945",
    event: "Điểm nhiễu không thuộc hồ sơ chính",
    coordinates: { lat: 20.4388, lng: 106.1621 },
    mapPosition: { top: "44%", left: "74%" },
    target: false,
    sourceStage: "Decoy",
  },
  {
    id: "can-tho",
    name: "Cần Thơ",
    period: "1945",
    event: "Điểm nhiễu không thuộc hồ sơ chính",
    coordinates: { lat: 10.0452, lng: 105.7469 },
    mapPosition: { top: "86%", left: "74%" },
    target: false,
    sourceStage: "Decoy",
  },
];

export const STAGE_1986_PREP_LOCATIONS = MAP_LOCATIONS;
export const STAGE_1986_PREP_TARGET_TOTAL = MAP_LOCATIONS.filter(
  (location) => location.target,
).length;
export const STAGE_1986_PREP_UV_RELEASE_COUNT = 3;

export const STAGE_1986_PREP_SUMMARY_BOX = [
  {
    id: "summary-1930",
    stageLabel: "Stage 1",
    title: "Mốc mở đầu 1930",
    details: "Hội nghị hợp nhất tổ chức cộng sản tại Hương Cảng.",
  },
  {
    id: "summary-1945-uprising",
    stageLabel: "Stage 2",
    title: "Tổng khởi nghĩa 1945",
    details:
      "Tân Trào, Hà Nội, Huế và Sài Gòn là các điểm then chốt trong hồ sơ.",
  },
  {
    id: "summary-1986",
    stageLabel: "Mục tiêu",
    title: "Mở khóa bộ công cụ 1986",
    details:
      "Khớp 3/5 sẽ nhận đèn UV. Khớp đủ 5/5 mới nhận nhật ký điệp vụ và mở hồ sơ 1986.",
  },
];
