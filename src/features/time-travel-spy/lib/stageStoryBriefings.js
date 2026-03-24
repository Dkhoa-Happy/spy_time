export const STAGE_STORY_BRIEFINGS = {
  screen1: {
    title: "Màn 1 — Sau thống nhất: Thiếu ăn",
    body: [
      "Sau năm 1975, đất nước bước vào thời kỳ xây dựng chủ nghĩa xã hội trong điều kiện vô cùng khó khăn.",
      "Kinh tế yếu kém, sản xuất chưa đáp ứng nhu cầu, thiếu lương thực trở thành vấn đề cấp bách.",
    ],
    actionLabel: "Bắt đầu",
  },
  screen3: {
    title: "Màn 3 — Cơ chế bao cấp",
    body: [
      "Nền kinh tế được quản lý theo cơ chế tập trung, quan liêu, bao cấp.",
      "Phân phối và lưu thông còn nhiều bất cập, gây khó khăn cho đời sống và sản xuất.",
    ],
    actionLabel: "Đã rõ",
  },
  screen4: {
    title: "Màn 4 — Tìm hướng khắc phục",
    body: [
      "Từ thực tiễn khó khăn, Đảng và nhân dân từng bước tìm tòi, khảo nghiệm những giải pháp mới để phát triển sản xuất.",
    ],
    actionLabel: "Tiếp tục",
  },
  screen5: {
    title: "Màn 5 — Biên giới Tây Nam",
    body: [
      "Tình hình biên giới Tây Nam ngày càng căng thẳng.",
      "Các cuộc tấn công diễn ra với quy mô lớn hơn, gây thiệt hại cho nhân dân vùng biên giới.",
    ],
    actionLabel: "Đã rõ",
  },
  screen6: {
    title: "Màn 6 — Phản công và chi viện",
    body: [
      "Việt Nam buộc phải vừa bảo vệ biên giới, vừa thực hiện nhiệm vụ quốc tế tại Campuchia.",
      "Chiến tranh làm áp lực kinh tế và lương thực tăng lên.",
    ],
    actionLabel: "Tiếp tục",
  },
  final: {
    title: "Màn cuối — Vượt qua thử thách",
    body: [
      "Dù gặp nhiều khó khăn, Đảng và nhân dân đã kiên cường vượt qua thử thách, từng bước tìm ra con đường phát triển phù hợp.",
    ],
    actionLabel: "Tiếp tục",
  },
};

export const formatStageStoryBriefing = (briefing) =>
  briefing?.body?.join("\n\n") ?? "";

export const getStage1975WaveBriefing = (wave) => {
  const briefings = {
    2: {
      title: "Wave 2 — Biên giới bất ổn",
      body: [
        "Những cuộc tấn công lẻ tẻ đã bắt đầu xuất hiện ở biên giới Tây Nam.",
        "Hậu phương phải giữ lúa và giữ rào để không bị cuốn vào thế bị động.",
      ],
      actionLabel: "Tiếp tục",
    },
    3: {
      title: "Wave 3 — Căng thẳng kéo dài",
      body: [
        "Xung đột không còn là những đợt quấy phá đơn lẻ.",
        "Dân cư biên giới bắt đầu chịu thêm sức ép, còn lương thực thì vẫn thiếu.",
      ],
      actionLabel: "Tiếp tục",
    },
    4: {
      title: "Wave 4 — Tấn công gia tăng",
      body: [
        "Các cuộc tấn công diễn ra với quy mô lớn hơn, gây thiệt hại cho nhân dân vùng biên giới.",
        "Giữ hàng rào vững là cách bảo toàn hậu phương trước khi tình hình xấu thêm.",
      ],
      actionLabel: "Tiếp tục",
    },
    5: {
      title: "Wave 5 — Giữ hậu phương",
      body: [
        "Khi biên giới căng thẳng, từng bó lúa ở hậu phương cũng trở thành nguồn lực cho phòng thủ.",
        "Thiếu tiền thì không phát triển được, thiếu lương thực thì tuyến giữ sẽ suy yếu.",
      ],
      actionLabel: "Tiếp tục",
    },
    6: {
      title: "Wave 6 — Phản công tự vệ",
      body: [
        "Việt Nam buộc phải vừa bảo vệ biên giới, vừa đáp trả các cuộc tấn công ngày càng dữ dội.",
        "Lúc này bộ đội không còn là lựa chọn phụ, mà là chỗ dựa để giữ tuyến.",
      ],
      actionLabel: "Tiếp tục",
    },
    7: {
      title: "Wave 7 — Chi viện biên giới",
      body: [
        "Lực lượng được huy động để giữ vùng biên và hỗ trợ các khu vực bị uy hiếp.",
        "Áp lực đè lên cả chiến trường lẫn nhịp sản xuất trong hậu phương.",
      ],
      actionLabel: "Tiếp tục",
    },
    8: {
      title: "Wave 8 — Chiến sự lan rộng",
      body: [
        "Chiến tranh diễn ra ác liệt hơn, kéo theo gánh nặng lớn về người và lương thực.",
        "Hậu phương phải vừa sản xuất, vừa chống đỡ những đợt tràn qua hàng rào.",
      ],
      actionLabel: "Tiếp tục",
    },
    9: {
      title: "Wave 9 — Vừa sản xuất, vừa chiến đấu",
      body: [
        "Đất nước phải cùng lúc lo đời sống, giữ biên giới và làm nghĩa vụ quốc tế.",
        "Mỗi mùa lúa giữ được là thêm một phần sức bền cho tuyến trước.",
      ],
      actionLabel: "Tiếp tục",
    },
    10: {
      title: "Wave 10 — Vượt qua thử thách",
      body: [
        "Trận cuối cùng không chỉ là chống địch, mà còn là thử sức bền của cả hậu phương.",
        "Giữ được wave này là giữ được nhịp sống giữa một giai đoạn đầy thử thách.",
      ],
      actionLabel: "Tiếp tục",
    },
  };

  return briefings[wave] ?? null;
};
