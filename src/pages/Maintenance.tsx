export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center px-6">
        <h1 className="text-5xl font-bold text-amber-900 mb-4">
          🔧 Em Manutenção
        </h1>
        <p className="text-xl text-amber-800 mb-6">
          Desculpe! Estamos realizando melhorias em nosso sistema.
        </p>
        <p className="text-amber-700 mb-8">
          Voltaremos em breve. Obrigado pela paciência!
        </p>
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-900"></div>
        </div>
      </div>
    </div>
  );
}
