const publicImage = (fileName) => encodeURI(`/${fileName}`);

export const STAGE_1945_MILESTONES = [
  {
    id: "quan-lenh-so-1",
    order: 1,
    title: "Quân lệnh số 1",
    dateLabel: "13/8/1945",
    infoText:
      "Ngày 13/8/1945, Trung ương Đảng phát lệnh Tổng khởi nghĩa trong cả nước (Quân lệnh số 1).",
    infoTextParts: [
      "Ngày 13/8/1945, Trung ương Đảng phát lệnh Tổng khởi nghĩa trong cả nước (",
      ").",
    ],
    placeholderVariant: "dispatch",
    imageSlot: "ARCHIVE ALPHA",
    imageSrc: publicImage("quan-lenh-so-1.jpg"),
    isFeatured: false,
    morsePuzzle: {
      id: "morse-quan-lenh",
      order: 1,
      label: "Mật thư 01",
      clueText: "Lệnh phát động Tổng khởi nghĩa toàn quốc vào ngày 13/8/1945.",
      signal: "--.- ..- .- -. / .-.. . -. .... / ... --- / -- --- -",
      acceptedAnswers: ["QUAN LENH SO MOT", "QUAN LENH SO 1"],
      solvedKeyword: "QUAN LENH SO MOT",
      keywordLabel: "Quân lệnh số 1",
      revealTags: ["13/8/1945", "Tổng khởi nghĩa"],
      successMessage:
        "Tín hiệu đầu tiên đã được giải mã. Mật lệnh khởi nghĩa toàn quốc đã lộ diện.",
    },
  },
  {
    id: "nhat-dau-hang",
    order: 2,
    title: "Nhật đầu hàng - thời cơ",
    dateLabel: "14/8/1945",
    infoText:
      "Ngày 14-8-1945, Nhật Bản chấp nhận đầu hàng Đồng minh.",
    placeholderVariant: "opportunity",
    imageSlot: "ARCHIVE BETA",
    imageSrc: publicImage("Mamoru Shigemitsu Surrender 1945.jpg"),
    isFeatured: false,
  },
  {
    id: "tong-khoi-nghia",
    order: 3,
    title: "Tổng khởi nghĩa",
    dateLabel: "Giữa tháng 8/1945",
    infoText: "Giữa tháng 8/1945, nhân dân cả nước nổi dậy giành chính quyền.",
    placeholderVariant: "uprising",
    imageSlot: "ARCHIVE GAMMA",
    imageSrc: publicImage("tong-khoi-nghia.png"),
    isFeatured: false,
  },
  {
    id: "chinh-phu-lam-thoi",
    order: 4,
    title: "Chính phủ lâm thời",
    dateLabel: "28/8/1945",
    infoText:
      "28/8/1945, Chính phủ lâm thời nước Việt Nam Dân chủ Cộng hòa được thành lập.",
    placeholderVariant: "cabinet",
    imageSlot: "ARCHIVE DELTA",
    imageSrc: publicImage("chinh-phu-lam-thoi.jpg"),
    isFeatured: false,
  },
  {
    id: "bao-dai-thoai-vi",
    order: 5,
    title: "Bảo Đại thoái vị",
    dateLabel: "30/8/1945",
    infoText:
      "30/8/1945, vua Bảo Đại thoái vị tại Ngọ Môn, trao ấn và kiếm cho Chính phủ lâm thời.",
    infoTextParts: [
      "30/8/1945, vua Bảo Đại thoái vị tại ",
      ", trao ấn và kiếm cho Chính phủ lâm thời.",
    ],
    placeholderVariant: "abdication",
    imageSlot: "ARCHIVE OMEGA",
    imageSrc: publicImage("vua-bao-dai-thoai-vi.jpg"),
    isFeatured: true,
    morsePuzzle: {
      id: "morse-ngo-mon",
      order: 2,
      label: "Mật thư 02",
      clueText: "Địa điểm vua Bảo Đại thoái vị vào ngày 30/8/1945.",
      signal: "-. --. --- / -- --- -.",
      acceptedAnswers: ["NGO MON"],
      solvedKeyword: "NGO MON",
      keywordLabel: "Ngọ Môn",
      revealTags: ["Huế", "Thoái vị"],
      successMessage:
        "Từ khóa địa điểm đã khớp. Hồ sơ thoái vị ở Huế đã được xác minh.",
    },
  },
  {
    id: "tuyen-ngon-doc-lap",
    order: 6,
    title: "Tuyên ngôn",
    dateLabel: "2/9/1945",
    infoText:
      "Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    infoTextParts: [
      "Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn ",
      ", khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    ],
    placeholderVariant: "proclamation",
    imageSlot: "ARCHIVE SIGMA",
    imageSrc: publicImage("bac ho doc ban tuyen ngôn độc lập.jpeg"),
    isFeatured: false,
    morsePuzzle: {
      id: "morse-doc-lap",
      order: 3,
      label: "Mật thư 03",
      clueText: "Từ khóa biểu tượng cho sự kiện ngày 2/9/1945 và màn cuối của room 1945.",
      signal: "-.. --- -.-. / .-.. .- .--.",
      acceptedAnswers: ["DOC LAP"],
      solvedKeyword: "DOC LAP",
      keywordLabel: "Độc lập",
      revealTags: ["2/9/1945", "Màn cuối"],
      successMessage:
        "Mật thư cuối đã mở. Từ khóa biểu tượng của ngày độc lập đã được xác nhận.",
    },
  },
];

export const STAGE_1945_TOTAL_PAIRS = STAGE_1945_MILESTONES.length;
export const STAGE_1945_MORSE_PUZZLES = STAGE_1945_MILESTONES.filter(
  (milestone) => Boolean(milestone.morsePuzzle),
).map((milestone) => ({
  ...milestone.morsePuzzle,
  milestoneId: milestone.id,
  milestoneTitle: milestone.title,
}));

const shuffleDeck = (cards) => {
  const deck = [...cards];

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
};

export const createShuffledStage1945Deck = () =>
  shuffleDeck(
    STAGE_1945_MILESTONES.flatMap((milestone) => [
      {
        id: `${milestone.id}-image`,
        pairId: milestone.id,
        cardType: "image",
        status: "face-down",
      },
      {
        id: `${milestone.id}-info`,
        pairId: milestone.id,
        cardType: "info",
        status: "face-down",
      },
    ]),
  );

export const getStage1945Milestone = (pairId) =>
  STAGE_1945_MILESTONES.find((milestone) => milestone.id === pairId);
