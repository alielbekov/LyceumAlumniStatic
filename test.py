matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]

target = 3
def searchMatrix(matrix, target):
        """
        :type matrix: List[List[int]]
        :type target: int
        :rtype: bool
        """
        top = len(matrix)-1  #2
        bottom = 0
        x = 0
        while bottom < top and x < 20:
            x +=1
            print(x)
            mid = (top+bottom)//2+1
            print("mid", mid, "top", top, "bottom", bottom)
    
            if matrix[mid][0]>target:
                top = mid-1
            elif matrix[mid][0]<target:
                bottom = mid
            print("mid", mid, "top", top, "bottom", bottom)
    
    
searchMatrix(matrix, target)