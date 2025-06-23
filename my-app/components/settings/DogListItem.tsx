"use client"
import type { DogProfile } from '@/types/dog'
import Image from 'next/image'
import Link from 'next/link'
import { PawPrint, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export const DogListItem = ({ dog, onDelete }: { dog: DogProfile; onDelete?: () => void }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [keepRecords, setKeepRecords] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteReasons = [
    { value: 'mistake', label: '誤って登録した' },
    { value: 'transfer', label: '譲渡した' },
    { value: 'rainbow_bridge', label: '虹の橋を渡った' },
    { value: 'other', label: 'その他' }
  ]

  const handleDelete = async () => {
    if (!deleteReason) {
      alert('削除理由を選択してください')
      return
    }

    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です')
        return
      }

      // 削除記録を作成
      const deleteRecord = {
        dog_id: dog.id,
        user_id: user.id,
        reason: deleteReason,
        deleted_at: new Date().toISOString(),
        keep_records: keepRecords,
        is_visible: keepRecords // 記録を残す場合は表示、残さない場合は非表示
      }

      // 削除記録テーブルに保存
      const { error: recordError } = await supabase
        .from('dog_deletion_records')
        .insert(deleteRecord)

      if (recordError) {
        console.error('削除記録の保存エラー:', recordError)
        // テーブルが存在しない場合は作成を試行
        if (recordError.message.includes('relation "dog_deletion_records" does not exist')) {
          alert('削除記録テーブルが存在しません。管理者にお問い合わせください。')
          return
        }
      }

      // 記録を残さない場合は、関連データを削除
      if (!keepRecords) {
        // otayoriテーブルから削除
        await supabase
          .from('otayori')
          .delete()
          .eq('dog_id', dog.id)

        // dog_user_relationsテーブルから削除
        await supabase
          .from('dog_user_relations')
          .delete()
          .eq('dog_id', dog.id)
      }

      // dogsテーブルから削除（または非表示フラグを設定）
      if (keepRecords) {
        // 記録を残す場合は、is_deletedフラグを設定
        const { error: updateError } = await supabase
          .from('dogs')
          .update({ is_deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', dog.id)
        
        if (updateError) {
          console.error('削除フラグ設定エラー:', updateError)
          throw new Error('削除フラグの設定に失敗しました')
        }
      } else {
        // 記録を残さない場合は、完全に削除
        const { error: deleteError } = await supabase
          .from('dogs')
          .delete()
          .eq('id', dog.id)
        
        if (deleteError) {
          console.error('完全削除エラー:', deleteError)
          throw new Error('完全削除に失敗しました')
        }
      }

      setShowDeleteModal(false)
      alert('わんちゃんの削除が完了しました')
      onDelete?.() // 親コンポーネントに削除完了を通知
      
      // ページをリロードして最新の状態を反映
      window.location.reload()

    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除中にエラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-4">
          {dog.image_url ? (
            <Image
              src={dog.image_url}
              alt={dog.name}
              width={56}
              height={56}
              className="rounded-full object-cover w-14 h-14 border-2 border-orange-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-200">
              <PawPrint className="w-8 h-8 text-orange-400" />
            </div>
          )}
          <div>
            <p className="font-bold text-lg text-gray-800">{dog.name}</p>
            <p className="text-sm text-gray-500">{dog.breed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dog/edit/${dog.id}`}>
            <span className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors">
              編集
            </span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} />
            削除
          </button>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">わんちゃんの削除</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-semibold text-red-600">{dog.name}</span> を削除しますか？
              </p>

              {/* 削除理由選択 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  削除理由を選択してください
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {deleteReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 記録の保持選択 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  記録はこのまま残しますか？
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="true"
                      checked={keepRecords}
                      onChange={(e) => setKeepRecords(e.target.value === 'true')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">はい（記録を残す）</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="false"
                      checked={!keepRecords}
                      onChange={(e) => setKeepRecords(e.target.value === 'true')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">いいえ（記録も削除する）</span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  {keepRecords 
                    ? '記録を残す場合：わんちゃんの情報は非表示になりますが、記録は保持されます。'
                    : '記録を削除する場合：わんちゃんの情報と記録が完全に削除されます。この操作は取り消せません。'
                  }
                </p>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || !deleteReason}
                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    削除中...
                  </>
                ) : (
                  '削除する'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 