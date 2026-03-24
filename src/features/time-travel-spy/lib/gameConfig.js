import { ROUTES } from "../../../shared/constants/routes";

export const TOTAL_STAGE_COUNT = 4;

export const ROOM_PASSWORDS = {
  1: "1930",
  2: "1945",
  4: "VI-121986-DMTD",
};

export const ROOM_TITLES = {
  1: "Stage 1: Mật mã năm 1930",
  2: "Stage 2: Mặt trận 1945",
  3: "Stage 3: Nông trại phòng tuyến 1975",
  4: "Stage 4: Đại hội VI và Đổi mới 1986",
};

export const ROOM_ROUTES = {
  1: ROUTES.stage1930,
  2: ROUTES.stage1945,
  3: ROUTES.stage1975,
  4: ROUTES.stage1986,
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

export const isStage1986ToolsetReady = (gameState) => {
  const inventory = gameState?.inventory ?? {
    uvLight: false,
    fieldNotebook: false,
  };

  return (
    Boolean(gameState?.stage1986PrepCompleted) &&
    inventory.uvLight &&
    inventory.fieldNotebook
  );
};

export const getResumeRoute = (gameState) => {
  if (gameState?.missionCompleted) {
    return ROUTES.missionComplete;
  }

  if ((gameState?.unlockedStage ?? 1) >= 4) {
    return isStage1986ToolsetReady(gameState)
      ? ROUTES.stage1986
      : ROUTES.stage1986Prep;
  }

  if (gameState?.unlockedStage === 3) {
    return ROUTES.stage1975;
  }

  if (gameState?.unlockedStage === 2) {
    return ROUTES.stage1945;
  }

  return ROUTES.stage1930;
};

export const getStageLockedMessage = (stage) => {
  if (stage === 2) {
    return "Bạn cần giải phòng 1930 trước khi tiếp cận 1945.";
  }

  if (stage === 3) {
    return "Bạn cần khép hồ sơ 1945 trước khi vào hậu phương 1975.";
  }

  return "Bạn cần giữ vững phòng tuyến 1975 trước khi vào manh mối 1986.";
};

export const getStageIncorrectMessage = (stage) => {
  if (stage === 4) {
    return "Sai mật lệnh. Hãy ghép lại theo số đại hội, thời điểm diễn ra và chữ cái đầu của cụm khóa.";
  }

  return "Sai mật khẩu. Thử lại như một điệp viên thực thụ.";
};
