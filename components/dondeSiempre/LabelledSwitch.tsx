import { Switch } from '../ui/switch';

export type LabelledSwitchProps = {
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

export default function LabelledSwitch(props: LabelledSwitchProps) {
  return (
    <div className="m-4 flex flex-row gap-4">
      <div className="pt-0.5">
        <Switch onCheckedChange={(checked) => props.onCheckedChange(checked)}></Switch>
      </div>
      <p className="font-bold text-secondary text-center text-md">{props.label}</p>
    </div>
  );
}
