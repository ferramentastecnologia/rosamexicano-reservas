import { useState, useEffect, useRef } from 'react';
import { paymentAPI } from '../services/api';
import { calculateTablesNeeded, ALL_TABLES } from '../lib/tables-config';
import { TableArea } from '../types';

interface MapaMesasProps {
  data: string;
  horario: string;
  numeroPessoas: number;
  selectedArea: TableArea | null;
  onMesasSelect: (mesas: number[]) => void;
}

export default function MapaMesas({
  data,
  horario,
  numeroPessoas,
  selectedArea,
  onMesasSelect,
}: MapaMesasProps) {
  const [availableTables, setAvailableTables] = useState<number[]>([]);
  const [selectedMesas, setSelectedMesas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ timestamp: number; data: number[] }>({ timestamp: 0, data: [] });

  // Buscar mesas disponíveis
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!data || !horario || !numeroPessoas || !selectedArea) {
        setAvailableTables([]);
        setSelectedMesas([]);
        return;
      }

      // Usar cache se disponível (30 segundos)
      const now = Date.now();
      if (now - cacheRef.current.timestamp < 30000) {
        setAvailableTables(cacheRef.current.data);
        return;
      }

      setLoading(true);

      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await paymentAPI.getAvailableTables({
          data,
          horario,
          numero_pessoas: numeroPessoas,
        });

        if (response.data.available_tables) {
          setAvailableTables(response.data.available_tables);
          cacheRef.current = {
            timestamp: now,
            data: response.data.available_tables,
          };
          setSelectedMesas([]); // Limpar seleção ao carregar novas mesas
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao buscar mesas disponíveis:', error);
          setAvailableTables([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTables();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [data, horario, numeroPessoas, selectedArea]);

  // Notificar mudanças nas mesas selecionadas
  useEffect(() => {
    onMesasSelect(selectedMesas);
  }, [selectedMesas, onMesasSelect]);

  const handleTableClick = (tableNumber: number) => {
    const tablesNeeded = calculateTablesNeeded(numeroPessoas);

    setSelectedMesas((prev) => {
      if (prev.includes(tableNumber)) {
        return prev.filter((t) => t !== tableNumber);
      } else {
        if (prev.length >= tablesNeeded) {
          return prev;
        }
        return [...prev, tableNumber].sort((a, b) => a - b);
      }
    });
  };

  if (!selectedArea) {
    return (
      <div className="w-full text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Selecione uma área para ver as mesas disponíveis</p>
      </div>
    );
  }

  if (!data || !horario || !numeroPessoas) {
    return (
      <div className="w-full text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Preencha os dados da reserva para continuar</p>
      </div>
    );
  }

  const tablesNeeded = calculateTablesNeeded(numeroPessoas);
  const filteredTables = ALL_TABLES.filter((t) => t.area === selectedArea);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Seleção de Mesas</h3>

        {/* Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Mesas necessárias:</strong> {tablesNeeded} (para {numeroPessoas} pessoa{numeroPessoas !== 1 ? 's' : ''})
          </p>
          <p className="text-sm text-blue-800">
            <strong>Selecionadas:</strong> {selectedMesas.length}/{tablesNeeded}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Carregando mesas disponíveis...</p>
          </div>
        )}

        {/* Grid de Mesas */}
        {!loading && availableTables.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-2 mb-4">
            {filteredTables.map((table) => {
              const isAvailable = availableTables.includes(table.number);
              const isSelected = selectedMesas.includes(table.number);

              return (
                <button
                  key={table.number}
                  onClick={() => handleTableClick(table.number)}
                  disabled={!isAvailable}
                  className={`p-2 rounded font-semibold text-sm transition-colors ${
                    !isAvailable
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                  }`}
                  title={isAvailable ? `Mesa ${table.number}` : `Mesa ${table.number} (Indisponível)`}
                >
                  {table.number}
                </button>
              );
            })}
          </div>
        ) : !loading ? (
          <div className="text-center py-6 text-gray-600">
            <p>Nenhuma mesa disponível para este horário</p>
            <p className="text-sm mt-2">Tente selecionar outro horário ou data</p>
          </div>
        ) : null}

        {/* Status */}
        {selectedMesas.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <strong>Mesas selecionadas:</strong> {selectedMesas.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
