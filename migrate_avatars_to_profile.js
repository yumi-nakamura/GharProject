 // avatarsバケット内の全ファイル一覧を取得
 // データ移行一括実行のためのファイルです。実行するのはlocalで行います。
 // require('dotenv').config({ path: '.env.local' });
 //　この処理はnodejsで実行する
 // ファイル名からuser_idを抽出（例: avatar_xxx_...jpg → xxx）
 // ファイルをダウンロード
 // profileバケットにアップロード
 // 移行成功: ファイル名 → profile/ユーザーID/avatar.jpg
 // 移行処理が完了しました



const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数から設定を取得
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを環境変数で指定してください');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateAvatars() {
  // avatarsバケット内の全ファイル一覧を取得
  const { data: files, error } = await supabase.storage.from('avatars').list('', { limit: 1000 });
  if (error) {
    console.error('ファイル一覧取得エラー:', error);
    return;
  }

  for (const file of files) {
    // ファイル名からuser_idを抽出（例: avatar_xxx_...jpg → xxx）
    const match = file.name.match(/^avatar_([a-zA-Z0-9\\-]+)_/);
    if (!match) {
      console.warn(`スキップ: user_id抽出失敗: ${file.name}`);
      continue;
    }
    const userId = match[1];

    // ファイルをダウンロード
    const { data: fileData, error: downloadError } = await supabase.storage.from('avatars').download(file.name);
    if (downloadError) {
      console.error(`ダウンロード失敗: ${file.name}`, downloadError);
      continue;
    }

    // profileバケットにアップロード
    const destPath = `${userId}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage.from('profile').upload(destPath, fileData, {
      contentType: file.metadata?.mimetype || 'image/jpeg',
      upsert: true,
    });
    if (uploadError) {
      console.error(`アップロード失敗: ${destPath}`, uploadError);
      continue;
    }

    console.log(`移行成功: ${file.name} → profile/${destPath}`);
  }
}

migrateAvatars().then(() => {
  console.log('移行処理が完了しました');
});