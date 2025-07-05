import Button from '@mui/material/Button';

export interface ButtonProps {
  label: string;
}

/**
 * @eoa/common 用 MUI テスト部品
 */
export const CustomButton = (props: ButtonProps) => {
  return (
    <Button>
      {props.label}
    </Button>
  );
};
