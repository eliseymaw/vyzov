export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">
        Профиль
      </h1>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p>Пол: Мужчина</p>
        <p className="mt-2">Возраст: 25</p>
        <p className="mt-2">Город: Москва</p>
      </div>
    </main>
  )
}