import React from 'react';

export default function GameRules() {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-blue-600">遊び方</h2>
      
      <div className="mb-4 text-left">
        <h3 className="font-semibold text-blue-800 mb-2">ゲームの目的</h3>
        <p className="text-gray-700 mb-2">
          「ハンカチ落とし」は、昔ながらの遊びをオンラインで楽しめるようにした2人対戦ゲームです。
          100ポイントを先に獲得したプレイヤーが勝利します。
        </p>
      </div>

      <div className="mb-4 text-left">
        <h3 className="font-semibold text-blue-800 mb-2">役割と基本ルール</h3>
        <p className="text-gray-700 mb-2">
          <span className="font-medium">ドロップ役</span>：相手の背後に自分のタイミングでハンカチを落とします。上手くタイミングを計れば多くのポイントを獲得できます。
        </p>
        <p className="text-gray-700 mb-2">
          <span className="font-medium">チェック役</span>：自分の後ろにハンカチが落とされたと思ったら1度だけ確認します。相手がハンカチを落としてから短い時間で確認すると相手の獲得ポイントを最小限にできます。
        </p>
      </div>

      <div className="mb-4 text-left">
        <h3 className="font-semibold text-blue-800 mb-2">ポイントシステム</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>ハンカチが落ちてからチェック役が振り向くまでの時間（秒）がドロップ役のポイントになります</li>
          <li>チェック役が振り向いた時にハンカチが落ちていなければドロップ役に60ポイント入ります</li>
          <li>ハンカチが落ちて1秒未満で振り向くとポイントは発生しません</li>
          <li>1ラウンドで最大60ポイントまで獲得できます</li>
        </ul>
      </div>

      <div className="text-left">
        <h3 className="font-semibold text-blue-800 mb-2">ゲームの流れ</h3>
        <p className="text-gray-700">
          1. 各ラウンドで役割が交代します<br />
          2. 両プレイヤーは60秒以内に行動を起こす必要があります<br />
          3. ラウンド終了後に結果が表示され、次のラウンドへ進みます<br />
        </p>
      </div>
    </div>
  );
} 