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
      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
        <h3 style={{fontFamily: 'var(--font-playfair)', color: 'var(--rosa-red)'}} className="text-2xl font-bold mb-6">Seleção de Mesas</h3>

        {/* Info */}
        <div style={{background: 'linear-gradient(135deg, rgba(215, 25, 25, 0.05), rgba(249, 143, 33, 0.05))'}} className="mb-6 p-4 border border-red-200 rounded-lg">
          <p className="text-sm text-gray-800 font-semibold">
            <span style={{color: 'var(--rosa-red)'}}>●</span> Mesas necessárias: <strong>{tablesNeeded}</strong> (para {numeroPessoas} pessoa{numeroPessoas !== 1 ? 's' : ''})
          </p>
          <p className="text-sm text-gray-800 font-semibold mt-2">
            <span style={{color: 'var(--rosa-orange)'}}>●</span> Selecionadas: <strong>{selectedMesas.length}/{tablesNeeded}</strong>
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
          <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-3 mb-6">
            {filteredTables.map((table) => {
              const isAvailable = availableTables.includes(table.number);
              const isSelected = selectedMesas.includes(table.number);

              return (
                <button
                  key={table.number}
                  onClick={() => handleTableClick(table.number)}
                  disabled={!isAvailable}
                  style={isSelected ? {background: 'linear-gradient(135deg, var(--rosa-red), var(--rosa-orange))'} : {}}
                  className={`p-3 rounded-lg font-bold text-sm transition-all ${
                    !isAvailable
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-red-300'
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
