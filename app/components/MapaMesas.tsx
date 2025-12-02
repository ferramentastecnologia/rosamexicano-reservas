'use client';

import { useState, useEffect } from 'react';
import { Check, X, Users, MapPin } from 'lucide-react';
import { TableArea, AREA_NAMES, AREA_DESCRIPTIONS } from '@/lib/tables-config';

type Mesa = {
  number: number;
  available: boolean;
  capacity: number;
  area: TableArea;
};

type MapaMesasProps = {
  data: string;
  horario: string;
  numeroPessoas: number;
  onMesasSelect: (mesas: number[]) => void;
  onAreaSelect?: (area: TableArea) => void;
};

export default function MapaMesas({ data, horario, numeroPessoas, onMesasSelect, onAreaSelect }: MapaMesasProps) {
  const [tables, setTables] = useState<Mesa[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<TableArea | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && horario && selectedArea) {
      loadAvailableTables();
    }
  }, [data, horario, selectedArea]);

  useEffect(() => {
    if (numeroPessoas > 0) {
      setSelectedTables([]);
    }
  }, [numeroPessoas]);

  // Limpar seleção de mesas ao mudar de área
  useEffect(() => {
    setSelectedTables([]);
    onMesasSelect([]);
  }, [selectedArea]);

  const loadAvailableTables = async () => {
    if (!selectedArea) return;

    setLoading(true);
    try {
      const response = await fetch('/api/get-available-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, horario, area: selectedArea }),
      });

      const result = await response.json();

      if (result.error) {
        console.error('Erro na API:', result.error);
        setTables([]);
      } else if (result.tables) {
        setTables(result.tables);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = (area: TableArea) => {
    setSelectedArea(area);
    onAreaSelect?.(area);
  };

  const toggleTable = (tableNumber: number) => {
    const table = tables.find(t => t.number === tableNumber);
    if (!table || !table.available) return;

    const mesasNecessarias = Math.ceil(numeroPessoas / 4);

    setSelectedTables(prev => {
      const isSelected = prev.includes(tableNumber);

      if (isSelected) {
        const newSelection = prev.filter(num => num !== tableNumber);
        onMesasSelect(newSelection);
        return newSelection;
      } else {
        if (prev.length < mesasNecessarias) {
          const newSelection = [...prev, tableNumber].sort((a, b) => a - b);
          onMesasSelect(newSelection);
          return newSelection;
        }
        return prev;
      }
    });
  };

  const pessoasValidas = numeroPessoas && !isNaN(numeroPessoas) && numeroPessoas > 0;
  const mesasNecessarias = pessoasValidas ? Math.ceil(numeroPessoas / 4) : 0;
  const selecaoCompleta = mesasNecessarias > 0 && selectedTables.length === mesasNecessarias;

  if (!data || !horario) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <p className="text-zinc-400 text-center">
          Selecione primeiro a data e o horário para ver as mesas disponíveis
        </p>
      </div>
    );
  }

  if (!pessoasValidas) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <p className="text-zinc-400 text-center">
          Informe o número de pessoas para selecionar as mesas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#E53935]" />
        Seleção de Mesas
      </h4>

      {/* Seletor de Área */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E53935]" />
          Escolha a área do restaurante
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['interno', 'semi-externo', 'externo'] as TableArea[]).map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => handleAreaSelect(area)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${selectedArea === area
                  ? 'bg-[#E53935] border-[#E53935] text-white scale-105 shadow-lg shadow-[#E53935]/30'
                  : 'bg-zinc-800 border-zinc-700 text-white hover:border-[#E53935] hover:bg-zinc-750'
                }
              `}
            >
              <p className="font-bold text-sm">{AREA_NAMES[area]}</p>
              <p className="text-xs mt-1 opacity-75">{AREA_DESCRIPTIONS[area]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mostrar mesas apenas se área selecionada */}
      {selectedArea ? (
        <>
          {/* Informações Compactas */}
          <div className="mb-4 bg-black rounded-lg p-4 border border-zinc-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Pessoas</p>
                <p className="text-xl font-bold text-[#E53935]">{numeroPessoas}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Mesas Necessárias</p>
                <p className="text-xl font-bold text-white">{mesasNecessarias}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Selecionadas</p>
                <p className={`text-xl font-bold ${selecaoCompleta ? 'text-green-500' : 'text-yellow-500'}`}>
                  {selectedTables.length}/{mesasNecessarias}
                </p>
              </div>
            </div>
          </div>

          {/* Status da Seleção */}
          {selectedTables.length > 0 && (
            <div className={`mb-4 p-3 rounded border ${
              selecaoCompleta
                ? 'bg-green-900/20 border-green-800'
                : 'bg-yellow-900/20 border-yellow-800'
            }`}>
              <p className={`text-sm ${selecaoCompleta ? 'text-green-400' : 'text-yellow-400'}`}>
                {selecaoCompleta ? (
                  <>
                    <Check className="w-4 h-4 inline mr-1" />
                    Seleção completa! Mesas: {selectedTables.join(', ')}
                  </>
                ) : (
                  <>
                    Selecione mais {mesasNecessarias - selectedTables.length} mesa(s)
                  </>
                )}
              </p>
            </div>
          )}

          {/* Mapa de Mesas */}
          {loading ? (
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : tables.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  {tables.filter(t => t.available).length} mesas disponíveis em {AREA_NAMES[selectedArea]}
                </p>
                <p className="text-sm text-zinc-400">
                  Clique para selecionar
                </p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tables.map(table => {
                  const isSelected = selectedTables.includes(table.number);
                  const isAvailable = table.available;

                  return (
                    <button
                      key={table.number}
                      type="button"
                      onClick={() => toggleTable(table.number)}
                      disabled={!isAvailable}
                      title={isAvailable ? `Mesa ${table.number} - ${table.capacity} pessoas` : `Mesa ${table.number} - Ocupada`}
                      className={`
                        aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                        transition-all duration-200 relative group
                        ${isSelected
                          ? 'bg-[#E53935] border-[#E53935] text-white scale-105 shadow-lg shadow-[#E53935]/50'
                          : isAvailable
                            ? 'bg-zinc-800 border-zinc-700 text-white hover:border-[#E53935] hover:scale-105 hover:shadow-lg'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-lg font-bold">{table.number}</span>
                      <span className="text-xs mt-1">
                        {isAvailable ? (
                          `${table.capacity}p`
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              <p>Nenhuma mesa encontrada nesta área</p>
            </div>
          )}

          {/* Legenda */}
          <div className="mt-4 flex gap-4 text-xs text-zinc-400 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-800 border border-zinc-700 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E53935] border border-[#E53935] rounded"></div>
              <span>Selecionada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-950 border border-zinc-800 rounded"></div>
              <span>Ocupada</span>
            </div>
          </div>

          {/* Botão de Atualizar */}
          <button
            type="button"
            onClick={loadAvailableTables}
            className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition"
          >
            Atualizar Disponibilidade
          </button>
        </>
      ) : (
        <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Selecione uma área acima para ver as mesas disponíveis</p>
        </div>
      )}
    </div>
  );
}
