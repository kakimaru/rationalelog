import { useId } from 'react';
import { labelClass, softFieldClass } from './styles';

export const PROJECT_NAME_MAX_LENGTH = 50;

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

export function ProjectNameField({ value, onChange, autoFocus = false }: Props) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        プロジェクト名
      </label>
      <input
        id={id}
        className={softFieldClass}
        value={value}
        maxLength={PROJECT_NAME_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        placeholder="例：家計簿アプリのオンボーディング改善"
        autoFocus={autoFocus}
        required
      />
      <p className="text-sm text-text-muted">社名を伏せた呼び名でも大丈夫です（50 文字まで）</p>
    </div>
  );
}
