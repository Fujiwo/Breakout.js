const main = require("./main");
test("sum()関数に二つの整数を指定した場合、その値を合算した値を返却することを確認する", () => {
  expect(main.sum(2, 3)).toBe(5); // main.sum()の実行結果が5であればテスト成功
});

test("throwError()関数を実行すると例外か発生    することを確認する。", () => {
    expect(main.throwError()).rejects.toThrow(); // 例外が発生したらテスト成功
  });

