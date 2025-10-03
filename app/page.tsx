use client;
import { useEffect, useMemo, useState } from "react";

// カード型
type Card = {
  id: number;
  symbol: string; // 絵文字など
  isJoker: boolean;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function Page() {
  const pairSymbols = useMemo(() => ["🍎", "🍋", "🍇", "🍓"], []); // 4ペア
  const [cards, setCards] = useState<Card[]>([]);
  const [firstIndex, setFirstIndex] = useState<number | null>(null);
  const [secondIndex, setSecondIndex] = useState<number | null>(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [message, setMessage] = useState("カードをめくってね！");
  const [gameOver, setGameOver] = useState(false);

  // 初期化 & リセット
  const buildDeck = () => {
    // 8枚(4ペア) + ジョーカー1枚 = 9枚
    const normals = pairSymbols.flatMap((s) => [
      { symbol: s, isJoker: false },
      { symbol: s, isJoker: false },
    ]);
    const deck = [...normals, { symbol: "🃏", isJoker: true }]
      .map((c, i) => ({ id: i, symbol: c.symbol, isJoker: c.isJoker, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5); // シャッフル

    setCards(deck);
    setFirstIndex(null);
    setSecondIndex(null);
    setLockBoard(false);
    setMessage("カードをめくってね！");
    setGameOver(false);
  };

  useEffect(() => {
    buildDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (idx: number) => {
    if (lockBoard || gameOver) return;
    const card = cards[idx];
    if (card.isMatched || card.isFlipped) return;

    // カードを一時的に表へ
    const next = cards.slice();
    next[idx] = { ...card, isFlipped: true };
    setCards(next);

    // ジョーカーなら即敗北＋自動リセット
    if (card.isJoker) {
      setMessage("🃏 ジョーカー！負けです… リセットしてもう一度！");
      setGameOver(true);
      setLockBoard(true);
      setTimeout(() => {
        buildDeck();
      }, 1000); // 1秒後に自動リセット
      return;
    }

    if (firstIndex === null) {
      setFirstIndex(idx);
      setMessage("もう1枚めくってね");
      return;
    }

    if (secondIndex === null) {
      setSecondIndex(idx);
      setLockBoard(true);

      // 判定
      const first = cards[firstIndex];
      const second = card; // すでに idx で反転済み

      if (first.symbol === second.symbol) {
        // 揃った！
        setTimeout(() => {
          setCards((current) => {
            const c = current.slice();
            c[firstIndex] = { ...c[firstIndex], isMatched: true };
            c[idx] = { ...c[idx], isMatched: true };
            return c;
          });
          setFirstIndex(null);
          setSecondIndex(null);
          setLockBoard(false);
          const matched = next.filter((x) => x.isMatched).length + 2; // いま2枚増える
          if (matched === 8) {
            setMessage("🎉 4ペア完成！ゲームクリア！");
            setGameOver(true);
          } else {
            setMessage("✅ 揃いました！続けてね");
          }
        }, 250);
      } else {
        // ちがう → 自動で裏へ
        setTimeout(() => {
          setCards((current) => {
            const c = current.slice();
            c[firstIndex] = { ...c[firstIndex], isFlipped: false };
            c[idx] = { ...c[idx], isFlipped: false };
            return c;
          });
          setFirstIndex(null);
          setSecondIndex(null);
          setLockBoard(false);
          setMessage("❌ ちがいました。もう一度！");
        }, 700);
      }
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">神経衰弱（9枚・ジョーカー1）</h1>
      <p className="text-sm opacity-80 text-center">
        4ペアを揃えたら勝ち。ジョーカー🃏をめくると即負け！
      </p>

      {/* 盤面 */}
      <div className="grid grid-cols-3 gap-0 select-none" style={{
        // 画像イメージに寄せた枠（青い線）
        boxShadow: "0 0 0 2px rgb(30 64 175)", // 外枠(blue-800)
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleClick(idx)}
            disabled={lockBoard || gameOver || card.isMatched}
            className="w-28 h-28 sm:w-32 sm:h-32 border border-blue-800 flex items-center justify-center text-3xl"
            style={{ background: card.isFlipped || card.isMatched ? "white" : "#e5e7eb" }}
            aria-label={`card-${idx}`}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span className="text-4xl">{card.symbol}</span>
            ) : (
              <span className="opacity-0">?</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-base">{message}</span>
        <button
          onClick={buildDeck}
          className="px-3 py-1 rounded-2xl border shadow-sm disabled:opacity-50"
        >
          リセット
        </button>
      </div>

      <details className="max-w-lg w-full mt-2 text-sm opacity-80">
        <summary className="cursor-pointer">学習ポイント（初心者向け）</summary>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>React の状態（<code>useState</code>）で「カード配列」「選択中の2枚」「ロック」を管理。</li>
          <li>シャッフルは <code>Array.sort(() =&gt; Math.random() - 0.5)</code> の簡易版。</li>
          <li>2枚目をめくったら一致判定。ちがえば <code>setTimeout</code> で裏へ戻します。</li>
          <li>ジョーカーはクリック時に即ゲームオーバー。</li>
          <li>Next.js App Router ではクライアント側で動かすので先頭に <code>"use client"</code> を付けます。</li>
        </ul>
      </details>
    </main>
  );
}