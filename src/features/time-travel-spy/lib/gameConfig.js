export const ROOM_PASSWORDS = {
  1: "1930",
  2: "1945",
  3: "VI-121986-DMTD",
};

export const ROOM_TITLES = {
  1: "Stage 1: Mật mã năm 1930",
  2: "Stage 2: Mặt trận 1945",
  3: "Stage 3: Đại hội VI và Đổi mới 1986",
};

export const ROOM_ROUTES = {
  1: "/room-1930",
  2: "/room-1945",
  3: "/room-1986",
};

export const normalizeAnswer = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

export const isCorrectPassword = (stage, value) => {
  const expected = ROOM_PASSWORDS[stage];

  if (!expected) {
    return false;
  }

  return normalizeAnswer(value) === normalizeAnswer(expected);
};
