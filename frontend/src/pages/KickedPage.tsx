export default function KickedPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6">
        <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm">
          Intervue Poll
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-3">
        You’ve been Kicked out !
      </h1>

      <p className="text-gray-500 max-w-md">
        Looks like the teacher had removed you from the poll system.
        Please Try again sometime.
      </p>
    </div>
  );
}