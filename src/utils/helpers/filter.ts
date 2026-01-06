export const filterObj = <T extends Record<string, any>>(
  obj: T,
  ...allowedFields: string[]
): Partial<T> => {
  const newObj: Partial<T> = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el as keyof T] = obj[el as keyof T];
    }
  });
  return newObj;
};
