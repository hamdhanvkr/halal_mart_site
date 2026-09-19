import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const FormField = ({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  options = [],
  rows = 4,
  accept,
  error,
  className = "",
}) => {
  const handleChange = (event) => {
    onChange(event);
  };

  const handleSelectChange = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </Label>

      {type === "textarea" && (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      )}

      {type === "select" && (
        <Select
          value={value ? String(value) : undefined}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === "file" && (
        <Input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
        />
      )}

      {!["textarea", "select", "file"].includes(type) && (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;